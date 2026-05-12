import { NextRequest, NextResponse } from 'next/server';
import { expireOldEdits } from '@/presentation/lib/container';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const cronSecret = requireEnv('CRON_SECRET');
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const result = await expireOldEdits.execute();

    return NextResponse.json({ success: true, expiredCount: result.expiredCount });
  } catch (err) {
    console.error('[cron/expire-edits]', err);
    return NextResponse.json({ error: 'Internal error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
