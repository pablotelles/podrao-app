import { NextRequest, NextResponse } from 'next/server';
import { incrementListView } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

// POST /api/lists/[id]/view — incrementa visualização (público, não requer auth)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await incrementListView.execute({ listId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
