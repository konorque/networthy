import { execSync } from 'node:child_process';
import { getTestDatabaseUrl } from './testEnv.js';

export default function setup() {
  const url = getTestDatabaseUrl();
  execSync('npx prisma migrate reset --force', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
