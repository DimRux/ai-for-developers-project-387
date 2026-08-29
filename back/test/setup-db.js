const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'test.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const env = {
  ...process.env,
  DATABASE_URL: 'file:./test.db',
  SEED_DEMO: 'true',
};

const opts = { env, cwd: path.join(__dirname, '..'), stdio: 'pipe' };

try {
  execSync('npx prisma migrate deploy', opts);
  execSync('npx ts-node --project tsconfig.json prisma/seed.ts', opts);
  console.log('Test database prepared successfully.');
} catch (e) {
  console.error('Failed to prepare test database:', e.stderr?.toString() ?? e.message);
  process.exit(1);
}
