import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

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
