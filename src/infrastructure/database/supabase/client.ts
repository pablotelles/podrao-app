import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Supabase renomeou "anon key" para "publishable key" — ambos aceitos
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Client público — respeita RLS, usado em server components e route handlers */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Client admin — bypassa RLS, usar apenas em routes protegidas server-side */
export function createAdminClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
