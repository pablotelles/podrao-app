/**
 * scripts/migrate.mjs
 * Executa as migrations SQL em ordem contra o banco Supabase.
 * Uso: npm run db:migrate
 *
 * Requer DATABASE_URL no .env.local:
 * postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega .env.local manualmente (sem depender de dotenv)
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
  console.error(`
❌  DATABASE_URL não encontrada no .env.local.

Adicione a connection string do Supabase:
  1. Acesse: https://supabase.com/dashboard/project/aqozqrurzfnxfmhgjdsq/settings/database
  2. Copie a "Connection string" no modo "Session" (porta 5432)
  3. Adicione ao .env.local:
     DATABASE_URL=postgresql://postgres.aqozqrurzfnxfmhgjdsq:[SUA_SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
`);
  process.exit(1);
}

const MIGRATIONS_DIR = path.resolve(__dirname, '../src/infrastructure/database/migrations');

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅  Conectado ao banco Supabase.');

    // Cria tabela de controle de migrations se não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Lista arquivos SQL em ordem
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Verifica quais já foram aplicadas
    const { rows: applied } = await client.query('SELECT filename FROM _migrations');
    const appliedSet = new Set(applied.map((r) => r.filename));

    let ran = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ⏭  ${file} (já aplicada)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      console.log(`  ▶  Executando ${file}...`);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅  ${file} aplicada.`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌  Erro em ${file}:`, err.message);
        process.exit(1);
      }
    }

    if (ran === 0) {
      console.log('\n✅  Banco já está atualizado. Nenhuma migration pendente.');
    } else {
      console.log(`\n✅  ${ran} migration(s) aplicada(s) com sucesso.`);
    }
  } finally {
    await client.end();
  }
}

run();
