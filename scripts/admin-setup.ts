/**
 * Crea las credenciales del panel y las guarda en .env.local.
 * Uso: npm run admin:setup  (ejecútalo en tu terminal: muestra secretos).
 */
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { generateTotpSecret, hashPassword } from '../src/lib/admin/crypto.ts';

async function ask(prompt: string): Promise<string> {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    const write = (rl as unknown as { _writeToOutput: (s: string) => void });
    stdout.write(prompt);
    write._writeToOutput = () => {};
    const answer = await rl.question('');
    rl.close();
    stdout.write('\n');
    return answer;
}

const password = await ask('Contraseña nueva (mínimo 12 caracteres): ');
if (password.length < 12) {
    console.error('La contraseña es muy corta.');
    process.exit(1);
}
if ((await ask('Repítela: ')) !== password) {
    console.error('Las contraseñas no coinciden.');
    process.exit(1);
}

const totp = generateTotpSecret();
const values: Record<string, string> = {
    ADMIN_PASSWORD_HASH: await hashPassword(password),
    ADMIN_TOTP_SECRET: totp,
    ADMIN_SESSION_SECRET: randomBytes(32).toString('base64url'),
};

const file = '.env.local';
const kept = existsSync(file)
    ? readFileSync(file, 'utf8')
          .split('\n')
          .filter((line) => line && !Object.keys(values).some((k) => line.startsWith(`${k}=`)))
    : [];
const lines = Object.entries(values).map(([k, v]) => `${k}=${v}`);
writeFileSync(file, `${[...kept, ...lines].join('\n')}\n`, { mode: 0o600 });

console.log(`
Credenciales guardadas en .env.local.

1. Abre tu app de códigos (Google Authenticator, Aegis, 1Password...), agrega
   una cuenta con clave manual y escribe esta clave:

   ${totp}

   O abre este enlace en el celular:
   otpauth://totp/Don%20Patacon:admin?secret=${totp}&issuer=Don%20Patacon

2. Para producción, carga estas variables en Vercel (Settings > Environment Variables):
   ${Object.keys(values).join(', ')},
   GITHUB_TOKEN y GITHUB_REPO. Copia los valores desde .env.local.

No pegues estos valores en un chat ni los subas al repo.
`);
