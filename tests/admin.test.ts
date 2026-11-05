import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    createSession, hashPassword, LoginThrottle, totpCode, totpStep,
    verifyPassword, verifySession, verifyTotp,
} from '../src/lib/admin/crypto.ts';
import { ConflictError, GitHubStore, revOf } from '../src/lib/admin/store.ts';

test('contraseña: acepta la correcta y rechaza otra', async () => {
    const stored = await hashPassword('una-clave-larga-123');
    assert.equal(await verifyPassword('una-clave-larga-123', stored), true);
    assert.equal(await verifyPassword('otra-clave', stored), false);
    assert.equal(await verifyPassword('x', 'basura'), false);
});

test('TOTP: coincide con el vector del RFC 6238', () => {
    // Secreto "12345678901234567890" en base32; t=59 s da 287082 con 6 dígitos.
    assert.equal(totpCode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', totpStep(59_000)), '287082');
});

test('TOTP: tolera 30 s y rechaza códigos viejos o mal formados', () => {
    const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
    const now = 1_000_000_000_000;
    const code = totpCode(secret, totpStep(now));
    assert.equal(verifyTotp(secret, code, now), totpStep(now));
    assert.notEqual(verifyTotp(secret, code, now + 30_000), null);
    assert.equal(verifyTotp(secret, code, now + 120_000), null);
    assert.equal(verifyTotp(secret, '12a456', now), null);
});

test('sesión: detecta firma alterada, otro secreto y vencimiento', () => {
    const secret = 'x'.repeat(40);
    const now = Date.now();
    const token = createSession(secret, now);
    assert.equal(verifySession(token, secret, now), true);
    assert.equal(verifySession(token, 'y'.repeat(40), now), false);
    assert.equal(verifySession(`${token}a`, secret, now), false);
    const forged = `${Buffer.from(JSON.stringify({ exp: now + 1e12 })).toString('base64url')}.${token.split('.')[1]}`;
    assert.equal(verifySession(forged, secret, now), false);
    assert.equal(verifySession(token, secret, now + 13 * 3_600_000), false);
    assert.equal(verifySession(undefined, secret, now), false);
});

test('límite de intentos: bloquea y libera al vencer', () => {
    const t = new LoginThrottle(2, 1000);
    t.fail('ip', 0);
    assert.equal(t.blocked('ip', 1), false);
    t.fail('ip', 2);
    assert.equal(t.blocked('ip', 3), true);
    assert.equal(t.blocked('ip', 2000), false);
});

/** GitHub falso en memoria para probar el flujo de commit sin tocar el repo real. */
function fakeGitHub(files: Record<string, string>) {
    let head = 'c1';
    let n = 0;
    const calls: string[] = [];
    const commits: Record<string, { tree: string; message?: string }> = { c1: { tree: 't1' } };
    const trees: Record<string, Record<string, string>> = { t1: { ...files } };
    const blobs: Record<string, string> = {};
    let raceOnce = false;
    const res = (b: unknown, status = 200) => new Response(typeof b === 'string' ? b : JSON.stringify(b), { status });
    const fetchFn = (async (url: string, init: RequestInit = {}) => {
        const path = String(url).replace('https://api.github.com/repos/o/r', '');
        const method = init.method ?? 'GET';
        calls.push(`${method} ${path}`);
        const body = init.body ? JSON.parse(String(init.body)) : null;
        if (path === '/git/ref/heads/main') return res({ object: { sha: head } });
        const contents = path.match(/^\/contents\/(.+)\?ref=(.+)$/);
        if (contents) {
            const file = trees[commits[contents[2]].tree][contents[1]];
            return file === undefined ? res({}, 404) : res(file);
        }
        const commit = path.match(/^\/git\/commits\/(.+)$/);
        if (commit && method === 'GET') return res({ tree: { sha: commits[commit[1]].tree } });
        if (path === '/git/blobs') {
            const sha = `b${++n}`;
            blobs[sha] = Buffer.from(body.content, 'base64').toString();
            return res({ sha });
        }
        if (path === '/git/trees') {
            const sha = `t${++n}`;
            trees[sha] = { ...trees[body.base_tree] };
            for (const e of body.tree) trees[sha][e.path] = blobs[e.sha];
            return res({ sha });
        }
        if (path === '/git/commits') {
            const sha = `c${++n}`;
            commits[sha] = { tree: body.tree, message: body.message };
            return res({ sha });
        }
        if (path === '/git/refs/heads/main') {
            assert.equal(body.force, false, 'nunca se fuerza la rama');
            if (raceOnce) {
                raceOnce = false;
                return res({}, 422);
            }
            head = body.sha;
            return res({ object: { sha: head } });
        }
        return res({}, 404);
    }) as typeof fetch;
    return {
        fetchFn, calls,
        current: () => trees[commits[head].tree],
        head: () => head,
        race: () => { raceOnce = true; },
    };
}

const DOCS = {
    'content/business.json': '{"a":1}\n',
    'content/menu.json': '{"b":1}\n',
    'content/pages.json': '{"c":1}\n',
};

const makeStore = (fetchFn: typeof fetch) =>
    new GitHubStore({ token: 't', repo: 'o/r', branch: 'main', fetch: fetchFn });

test('GitHubStore: lee y hace un commit con varios archivos', async () => {
    const gh = fakeGitHub(DOCS);
    const store = makeStore(gh.fetchFn);
    const docs = await store.readDocs();
    assert.equal(docs.menu, '{"b":1}\n');
    const sha = await store.write(
        [{ path: 'content/menu.json', content: Buffer.from('{"b":2}\n') }],
        'contenido: carta',
        { menu: revOf(docs.menu) },
    );
    assert.equal(sha, gh.head());
    assert.equal(gh.current()['content/menu.json'], '{"b":2}\n');
    assert.equal(gh.current()['content/pages.json'], '{"c":1}\n');
});

test('GitHubStore: rechaza si el documento cambió en otra sesión', async () => {
    const gh = fakeGitHub(DOCS);
    const store = makeStore(gh.fetchFn);
    await assert.rejects(
        store.write([{ path: 'content/menu.json', content: Buffer.from('x') }], 'm', { menu: revOf('viejo') }),
        ConflictError,
    );
    assert.equal(gh.current()['content/menu.json'], '{"b":1}\n');
});

test('GitHubStore: reintenta una vez si la rama se movió en medio', async () => {
    const gh = fakeGitHub(DOCS);
    gh.race();
    const store = makeStore(gh.fetchFn);
    await store.write([{ path: 'public/media/a.webp', content: Buffer.from('img') }], 'm');
    assert.equal(gh.current()['public/media/a.webp'], 'img');
    assert.equal(gh.calls.filter((c) => c === 'PATCH /git/refs/heads/main').length, 2);
});
