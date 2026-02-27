import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const lat = parseFloat(searchParams.get('lat'));
    const lon = parseFloat(searchParams.get('lon'));
    const radius = parseFloat(searchParams.get('radius') || '5');
    const excludeId = searchParams.get('excludeId');

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'lat and lon query parameters are required' },
        { status: 400 }
      );
    }

    const pipeline = [
      {
        $match: {
          coordinates: { $ne: null },
          ...(excludeId ? { _id: { $ne: new (await import('mongoose')).default.Types.ObjectId(excludeId) } } : {}),
        },
      },
      {
        $addFields: {
          distance: {
            $sqrt: {
              $add: [
                { $pow: [{ $subtract: ['$coordinates.lat', lat] }, 2] },
                { $pow: [{ $subtract: ['$coordinates.lon', lon] }, 2] },
              ],
            },
          },
        },
      },
      { $match: { distance: { $lte: radius } } },
      { $sort: { distance: 1 } },
      { $limit: 8 },
    ];

    const results = await Event.aggregate(pipeline);

    return NextResponse.json({
      center: { lat, lon },
      radius,
      count: results.length,
      events: results,
    });
  } catch (error) {
    console.error('Error fetching nearby events:', error);
    return NextResponse.json({ error: 'Error fetching nearby events' }, { status: 500 });
  }
}
