/** Secretos del panel, leídos en ejecución (nunca llegan al navegador). */
import { getSecret } from 'astro:env/server';
import { GitHubStore, LocalStore, type ContentStore } from './store';

export function authConfig() {
    const passwordHash = getSecret('ADMIN_PASSWORD_HASH');
    const totpSecret = getSecret('ADMIN_TOTP_SECRET');
    const sessionSecret = getSecret('ADMIN_SESSION_SECRET');
    if (!passwordHash || !totpSecret || !sessionSecret || sessionSecret.length < 32) {
        return null;
    }
    return { passwordHash, totpSecret, sessionSecret };
}

export class StoreNotConfigured extends Error {}

export function getStore(): ContentStore {
    const token = getSecret('GITHUB_TOKEN');
    const repo = getSecret('GITHUB_REPO');
    if (token && repo) {
        return new GitHubStore({
            token,
            repo,
            branch: getSecret('GITHUB_BRANCH') || 'main',
            apiUrl: getSecret('GITHUB_API_URL') || undefined,
        });
    }
    if (import.meta.env.DEV) return new LocalStore(process.cwd());
    throw new StoreNotConfigured();
}

export const deployedCommit = () => getSecret('VERCEL_GIT_COMMIT_SHA') || null;

export const COOKIE_NAME = import.meta.env.PROD ? '__Host-dp_admin' : 'dp_admin';
