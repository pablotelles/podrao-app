/**
 * scripts/rollback-migration.mjs
 * Remove uma migration específica do tracking e permite reaplicá-la
 *
 * Uso: node scripts/rollback-migration.mjs <nome_da_migration>
 * Exemplo: node scripts/rollback-migration.mjs 03_create_tables.sql
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega .env.local
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌  .env.local não encontrado.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL não encontrada no .env.local.');
  process.exit(1);
}

const migrationName = process.argv[2];
if (!migrationName) {
  console.error(`
❌  Nome da migration não fornecido.

Uso: node scripts/rollback-migration.mjs <nome_da_migration>

Exemplo: node scripts/rollback-migration.mjs 03_create_tables.sql

Isso vai:
1. Remover a migration do tracking (_migrations table)
2. Você pode então executar "npm run db:migrate" para reaplicar
  `);
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅  Conectado ao banco Supabase.');

    // Verifica se a migration existe no tracking
    const { rows } = await client.query('SELECT * FROM _migrations WHERE filename = $1', [
      migrationName,
    ]);

    if (rows.length === 0) {
      console.log(`⚠️  Migration "${migrationName}" não está no tracking.`);
      console.log('   Ela nunca foi aplicada ou já foi removida.');
      process.exit(0);
    }

    // Remove do tracking
    await client.query('DELETE FROM _migrations WHERE filename = $1', [migrationName]);

    console.log(`✅  Migration "${migrationName}" removida do tracking.`);
    console.log('');
    console.log('📝  Próximos passos:');
    console.log('   1. Atualize o arquivo da migration se necessário');
    console.log('   2. Execute "npm run db:migrate" para reaplicar');
    console.log('');
    console.log('⚠️  ATENÇÃO: Certifique-se de que a migration é idempotente!');
    console.log('   Use CREATE TABLE IF NOT EXISTS, DROP TABLE IF EXISTS, etc.');
  } catch (err) {
    console.error('❌  Erro:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
