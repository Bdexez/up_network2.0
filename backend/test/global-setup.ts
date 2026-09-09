import { execSync } from 'node:child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Prépare la base de test avant la suite e2e : on repart d'un schéma propre
 * pour que les tests ne dépendent jamais d'un état laissé par un run précédent.
 */
export default function globalSetup() {
  dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL manquant : voir backend/.env.test');
  if (!/up_network_test/.test(url)) {
    // Garde-fou : on ne veut surtout pas réinitialiser la base de développement.
    throw new Error(
      `Les tests refusent de s'exécuter sur ${url} : la base doit s'appeler up_network_test`,
    );
  }

  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: url,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'tests',
    },
    stdio: 'ignore',
  });
}
