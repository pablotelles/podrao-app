import { NextResponse } from 'next/server';
import { getPublicLists } from '@/presentation/lib/container';
import { errorResponse } from '@/presentation/lib/api-helpers';

export async function GET() {
  try {
    const lists = await getPublicLists.execute({});
    return NextResponse.json(lists);
  } catch (err) {
    return errorResponse(err);
  }
}
