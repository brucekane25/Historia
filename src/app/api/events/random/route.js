import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const pipeline = [];

    // Only events with coordinates so we can fly to them
    const match = { coordinates: { $ne: null } };
    if (category) {
      match.category = category.toLowerCase();
    }
    pipeline.push({ $match: match });
    pipeline.push({ $sample: { size: 1 } });

    const results = await Event.aggregate(pipeline);

    if (results.length === 0) {
      return NextResponse.json({ error: 'No events found' }, { status: 404 });
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    console.error('Error fetching random event:', error);
    return NextResponse.json({ error: 'Error fetching random event' }, { status: 500 });
  }
}
