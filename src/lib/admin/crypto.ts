/**
 * Contraseña (scrypt), segundo factor (TOTP, RFC 6238) y sesión firmada.
 * Sin base de datos: todo se verifica con los secretos del entorno.
 */
import {
    createHmac,
    randomBytes,
    scrypt as scryptCb,
    timingSafeEqual,
} from 'node:crypto';

const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LEN = 32;

function derive(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scryptCb(password.normalize('NFKC'), salt, KEY_LEN, SCRYPT, (err, key) =>
            err ? reject(err) : resolve(key),
        );
    });
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await derive(password, salt);
    return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [scheme, salt, key] = stored.split('$');
    if (scheme !== 'scrypt' || !salt || !key) return false;
    const expected = Buffer.from(key, 'base64url');
    if (expected.length !== KEY_LEN) return false;
    const actual = await derive(password, Buffer.from(salt, 'base64url'));
    return timingSafeEqual(actual, expected);
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(): string {
    let out = '';
    for (const byte of randomBytes(20)) out += BASE32[byte % 32];
    return out;
}

function base32Decode(input: string): Buffer {
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];
    for (const char of input.toUpperCase().replace(/[^A-Z2-7]/g, '')) {
        value = (value << 5) | BASE32.indexOf(char);
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
}

export function totpCode(secret: string, step: number): string {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(step));
    const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const num = hmac.readUInt32BE(offset) & 0x7fffffff;
    return String(num % 1_000_000).padStart(6, '0');
}

export const totpStep = (now = Date.now()) => Math.floor(now / 30_000);

/** Devuelve el paso de tiempo que coincide (con ±30 s de tolerancia) o null. */
export function verifyTotp(secret: string, code: string, now = Date.now()): number | null {
    if (!/^\d{6}$/.test(code)) return null;
    const step = totpStep(now);
    for (const candidate of [step, step - 1, step + 1]) {
        const a = Buffer.from(totpCode(secret, candidate));
        if (timingSafeEqual(a, Buffer.from(code))) return candidate;
    }
    return null;
}

export const SESSION_HOURS = 12;

function signature(payload: string, secret: string): Buffer {
    return createHmac('sha256', secret).update(payload).digest();
}

export function createSession(secret: string, now = Date.now()): string {
    const payload = Buffer.from(
        JSON.stringify({ exp: now + SESSION_HOURS * 3_600_000 }),
    ).toString('base64url');
    return `${payload}.${signature(payload, secret).toString('base64url')}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()): boolean {
    if (!token) return false;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return false;
    const expected = signature(payload, secret);
    const actual = Buffer.from(sig, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    try {
        const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
        return typeof exp === 'number' && exp > now;
    } catch {
        return false;
    }
}

/** Límite de intentos por IP. Vive en memoria de cada instancia: es una ayuda, no la única barrera. */
export class LoginThrottle {
    private attempts = new Map<string, { count: number; until: number }>();
    private max: number;
    private windowMs: number;

    constructor(max = 5, windowMs = 15 * 60_000) {
        this.max = max;
        this.windowMs = windowMs;
    }

    blocked(key: string, now = Date.now()): boolean {
        const entry = this.attempts.get(key);
        if (!entry) return false;
        if (entry.until <= now) {
            this.attempts.delete(key);
            return false;
        }
        return entry.count >= this.max;
    }

    fail(key: string, now = Date.now()): void {
        const entry = this.attempts.get(key);
        if (!entry || entry.until <= now) {
            this.attempts.set(key, { count: 1, until: now + this.windowMs });
        } else {
            entry.count += 1;
        }
    }

    clear(key: string): void {
        this.attempts.delete(key);
    }
}
