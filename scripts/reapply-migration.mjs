/**
 * scripts/reapply-migration.mjs
 * Remove uma migration do tracking e reaplicar em uma única operação
 *
 * Uso: node scripts/reapply-migration.mjs <nome_da_migration>
 * Exemplo: node scripts/reapply-migration.mjs 03_create_tables.sql
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

Uso: node scripts/reapply-migration.mjs <nome_da_migration>

Exemplo: node scripts/reapply-migration.mjs 03_create_tables.sql

Isso vai:
1. Remover a migration do tracking
2. Executar a migration novamente
  `);
  process.exit(1);
}

const MIGRATIONS_DIR = path.resolve(__dirname, '../src/infrastructure/database/migrations');

async function run() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅  Conectado ao banco Supabase.');

    // Verifica se o arquivo existe
    const migrationPath = path.join(MIGRATIONS_DIR, migrationName);
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌  Arquivo não encontrado: ${migrationName}`);
      process.exit(1);
    }

    // Remove do tracking (se existir)
    const { rowCount } = await client.query('DELETE FROM _migrations WHERE filename = $1', [
      migrationName,
    ]);

    if (rowCount > 0) {
      console.log(`🔄  Migration "${migrationName}" removida do tracking.`);
    } else {
      console.log(`ℹ️  Migration "${migrationName}" não estava no tracking.`);
    }

    // Lê e executa a migration
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    console.log(`▶️  Executando ${migrationName}...`);

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [migrationName]);
      await client.query('COMMIT');
      console.log(`✅  ${migrationName} aplicada com sucesso.`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌  Erro ao executar migration:`, err.message);
      process.exit(1);
    }

    // Força reload do PostgREST
    console.log('🔄  Recarregando schema do PostgREST...');
    await client.query("SELECT pg_notify('pgrst', 'reload schema')");
    console.log('✅  Schema recarregado!');
  } catch (err) {
    console.error('❌  Erro:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
