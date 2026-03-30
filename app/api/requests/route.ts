import { NextResponse } from 'next/server';
import { getAllRequestRecords } from '@/lib/requestStore';

/**
 * GET /api/requests
 * Returns the full local history of all processed requests with their R2 URLs.
 */
export async function GET() {
  try {
    const records = getAllRequestRecords();
    return NextResponse.json({ count: records.length, records }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read request history' }, { status: 500 });
  }
}
