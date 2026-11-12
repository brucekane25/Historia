import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';
import mongoose from 'mongoose';

// Gloria serves this API from its own Node runtime; never pre-render it.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const lat = parseFloat(searchParams.get('lat'));
    const lon = parseFloat(searchParams.get('lon'));
    const rawRadius = parseFloat(searchParams.get('radius') || '5');
    const radius = Number.isFinite(rawRadius)
      ? Math.min(Math.max(rawRadius, 0.1), 90)
      : 5;
    const excludeId = searchParams.get('excludeId');

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        { error: 'Valid lat and lon query parameters are required' },
        { status: 400 }
      );
    }

    const match = { coordinates: { $ne: null } };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      match._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const pipeline = [
      { $match: match },
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
