import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getSupabaseUrl(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_URL');
}

function getSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  );
}

let publicClient: SupabaseClient | undefined;

function getPublicClient(): SupabaseClient {
  if (!publicClient) {
    publicClient = createClient(getSupabaseUrl(), getSupabasePublishableKey());
  }

  return publicClient;
}

function createLazyClient(getClient: () => SupabaseClient): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      const client = getClient();
      const value = Reflect.get(client, prop);
      return typeof value === 'function' ? value.bind(client) : value;
    },
  });
}

/** Client público — respeita RLS, usado em server components e route handlers */
export const supabase: SupabaseClient = createLazyClient(getPublicClient);

/** Client admin — bypassa RLS, usar apenas em routes protegidas server-side */
export function createAdminClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
