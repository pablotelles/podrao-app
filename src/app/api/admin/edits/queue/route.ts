import { NextRequest, NextResponse } from 'next/server';
import { listExpiredEditsQueue, listLevel2PendingEdits } from '@/presentation/lib/container';
import { requireAdmin, errorResponse } from '@/presentation/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const type = req.nextUrl.searchParams.get('type');

    if (type === 'level2') {
      const edits = await listLevel2PendingEdits.execute();
      return NextResponse.json(edits);
    }

    // Default: expired queue
    const edits = await listExpiredEditsQueue.execute();
    return NextResponse.json(edits);
  } catch (err) {
    return errorResponse(err);
  }
}
