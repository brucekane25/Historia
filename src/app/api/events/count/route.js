import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

// Gloria serves this API from its own Node runtime; never pre-render it.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  try {
    await dbConnect();
    
    const totalEvents = await Event.countDocuments();
    const withCoords = await Event.countDocuments({ coordinates: { $ne: null } });
    const sample = await Event.findOne();
    
    return NextResponse.json({
      totalEvents,
      withCoordinates: withCoords,
      sampleEvent: sample,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
