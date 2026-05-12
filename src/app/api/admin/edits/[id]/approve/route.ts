import { NextRequest, NextResponse } from 'next/server';
import { approveEditByAdmin } from '@/presentation/lib/container';
import { requireAdmin, errorResponse } from '@/presentation/lib/api-helpers';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id: editId } = await params;

    await approveEditByAdmin.execute({ editId, adminId: admin.id });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
