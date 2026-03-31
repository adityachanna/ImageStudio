import { NextResponse } from 'next/server';
import { getTicketsCollection } from '@/lib/mongo';

/**
 * GET /api/requests
 * Returns the full local history of all processed requests with their R2 URLs.
 */
export async function GET() {
  try {
    const collection = await getTicketsCollection();
    const records = await collection
      .find(
        { requestId: { $exists: true, $type: 'string', $ne: '' } },
        {
          projection: {
            _id: 0,
            requestId: 1,
            requestType: 1,
            reviewType: 1,
            status: 1,
            currentStep: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        }
      )
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ count: records.length, records }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to read request history from MongoDB' }, { status: 500 });
  }
}
