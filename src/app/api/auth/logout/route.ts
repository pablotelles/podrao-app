import { NextResponse } from 'next/server';
import { createRouteSupabaseClient } from '@/presentation/lib/api-helpers';

export async function POST() {
  const supabase = await createRouteSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
