/**
 * Donde vive el contenido que edita el panel.
 * - GitHubStore (producción): lee y escribe en el repo; cada publicación es un
 *   commit atómico que dispara el deploy.
 * - LocalStore (solo desarrollo): lee y escribe los archivos del disco.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const DOC_FILES = ['business', 'menu', 'pages'] as const;
export type DocFile = (typeof DOC_FILES)[number];
export const docPath = (name: DocFile) => `content/${name}.json`;

export const revOf = (text: string) => createHash('sha256').update(text).digest('hex');
export const serializeDoc = (doc: unknown) => `${JSON.stringify(doc, null, 2)}\n`;

export interface WriteFile {
    path: string;
    content: Buffer;
}

export interface HistoryEntry {
    sha: string;
    message: string;
    date: string;
}

export class ConflictError extends Error {}

export interface ContentStore {
    readonly hasHistory: boolean;
    /** Lee los documentos; con `at`, en un commit anterior. */
    readDocs(at?: string): Promise<Record<DocFile, string>>;
    /** Lee un archivo publicado o recién subido, como una imagen. */
    readBinary(path: string): Promise<Buffer>;
    /** Escribe si `expected` coincide con lo actual; devuelve el commit (o null en local). */
    write(
        files: WriteFile[],
        message: string,
        expected?: Partial<Record<DocFile, string>>,
    ): Promise<string | null>;
    history(): Promise<HistoryEntry[]>;
    /** ¿`head` ya incluye a `commit`? */
    includes(commit: string, head: string): Promise<boolean>;
}

function assertRevs(
    current: Record<DocFile, string>,
    expected: Partial<Record<DocFile, string>> | undefined,
) {
    for (const [name, rev] of Object.entries(expected ?? {})) {
        if (revOf(current[name as DocFile]) !== rev) {
            throw new ConflictError(name);
        }
    }
}

export class LocalStore implements ContentStore {
    readonly hasHistory = false;
    private root: string;

    constructor(root: string) {
        this.root = root;
    }

    async readDocs(): Promise<Record<DocFile, string>> {
        const entries = await Promise.all(
            DOC_FILES.map(async (name) => [
                name,
                await readFile(join(this.root, docPath(name)), 'utf8'),
            ]),
        );
        return Object.fromEntries(entries);
    }

    async readBinary(path: string): Promise<Buffer> {
        return readFile(join(this.root, path));
    }

    async write(files: WriteFile[], _message: string, expected?: Partial<Record<DocFile, string>>) {
        assertRevs(await this.readDocs(), expected);
        for (const file of files) {
            const target = join(this.root, file.path);
            await mkdir(dirname(target), { recursive: true });
            await writeFile(target, file.content);
        }
        return null;
    }

    async history(): Promise<HistoryEntry[]> {
        return [];
    }

    async includes(): Promise<boolean> {
        return true;
    }
}

export interface GitHubConfig {
    token: string;
    repo: string;
    branch: string;
    apiUrl?: string;
    fetch?: typeof fetch;
}

export class GitHubError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export class GitHubStore implements ContentStore {
    readonly hasHistory = true;
    private cfg: GitHubConfig;

    constructor(cfg: GitHubConfig) {
        this.cfg = cfg;
    }

    private async call(path: string, init: RequestInit = {}, accept = 'application/vnd.github+json') {
        const base = this.cfg.apiUrl ?? 'https://api.github.com';
        const doFetch = this.cfg.fetch ?? fetch;
        const res = await doFetch(`${base}/repos/${this.cfg.repo}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${this.cfg.token}`,
                Accept: accept,
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'don-patacon-panel',
                ...(init.body ? { 'Content-Type': 'application/json' } : {}),
            },
        });
        if (!res.ok) {
            throw new GitHubError(res.status, `GitHub respondió ${res.status} en ${path.split('?')[0]}`);
        }
        return res;
    }

    private async json(path: string, init?: RequestInit) {
        return (await this.call(path, init)).json();
    }

    private async head(): Promise<string> {
        const ref = await this.json(`/git/ref/heads/${this.cfg.branch}`);
        return ref.object.sha;
    }

    async readDocs(at?: string): Promise<Record<DocFile, string>> {
        const sha = at ?? (await this.head());
        const entries = await Promise.all(
            DOC_FILES.map(async (name) => {
                const res = await this.call(
                    `/contents/${docPath(name)}?ref=${sha}`,
                    {},
                    'application/vnd.github.raw+json',
                );
                return [name, await res.text()];
            }),
        );
        return Object.fromEntries(entries);
    }

    async readBinary(path: string): Promise<Buffer> {
        const sha = await this.head();
        const res = await this.call(`/contents/${path}?ref=${sha}`, {}, 'application/vnd.github.raw+json');
        return Buffer.from(await res.arrayBuffer());
    }

    async write(files: WriteFile[], message: string, expected?: Partial<Record<DocFile, string>>) {
        // Dos intentos: si otra escritura movió la rama en medio, se revalida y se reintenta.
        for (let attempt = 0; ; attempt++) {
            const head = await this.head();
            if (expected) assertRevs(await this.readDocs(head), expected);
            const commit = await this.json(`/git/commits/${head}`);
            const tree = await Promise.all(
                files.map(async (file) => {
                    const blob = await this.json('/git/blobs', {
                        method: 'POST',
                        body: JSON.stringify({
                            content: file.content.toString('base64'),
                            encoding: 'base64',
                        }),
                    });
                    return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha };
                }),
            );
            const newTree = await this.json('/git/trees', {
                method: 'POST',
                body: JSON.stringify({ base_tree: commit.tree.sha, tree }),
            });
            const newCommit = await this.json('/git/commits', {
                method: 'POST',
                body: JSON.stringify({ message, tree: newTree.sha, parents: [head] }),
            });
            try {
                await this.json(`/git/refs/heads/${this.cfg.branch}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ sha: newCommit.sha, force: false }),
                });
                return newCommit.sha as string;
            } catch (err) {
                if (err instanceof GitHubError && err.status === 422 && attempt === 0) continue;
                throw err;
            }
        }
    }

    async history(): Promise<HistoryEntry[]> {
        const list = await this.json(
            `/commits?sha=${this.cfg.branch}&path=content&per_page=20`,
        );
        return list.map((c: { sha: string; commit: { message: string; author: { date: string } } }) => ({
            sha: c.sha,
            message: c.commit.message.split('\n')[0],
            date: c.commit.author.date,
        }));
    }

    async includes(commit: string, head: string): Promise<boolean> {
        if (commit === head) return true;
        const cmp = await this.json(`/compare/${commit}...${head}`);
        return cmp.status === 'ahead' || cmp.status === 'identical';
    }
}
