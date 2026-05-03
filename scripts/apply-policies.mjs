/**
 * scripts/apply-policies.mjs
 * Aplica as RLS policies do diretório policies/ ao banco Supabase.
 * Uso: npm run db:policies
 *
 * Este script é idempotente — pode ser executado múltiplas vezes.
 * Cada arquivo .sql usa DROP POLICY IF EXISTS antes de CREATE POLICY.
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

const POLICIES_DIR = path.resolve(__dirname, '../src/infrastructure/database/policies');

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅  Conectado ao banco Supabase.\n');

    // Lista arquivos SQL em ordem alfabética
    const files = fs
      .readdirSync(POLICIES_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  Nenhum arquivo .sql encontrado em policies/');
      return;
    }

    for (const file of files) {
      const filePath = path.join(POLICIES_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`▶  Aplicando ${file}...`);
      await client.query(sql);
      console.log(`✅  ${file} aplicada.\n`);
    }

    console.log(`✅  ${files.length} arquivo(s) de policies aplicado(s) com sucesso.`);
  } catch (err) {
    console.error('\n❌  Erro ao aplicar policies:', err.message);
    if (err.detail) console.error('   Detalhe:', err.detail);
    if (err.hint) console.error('   Dica:', err.hint);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
