import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const sourceEvent = await Event.findById(id);
    if (!sourceEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Find events with same category, within ±50 years, excluding source
    const related = await Event.find({
      _id: { $ne: sourceEvent._id },
      category: sourceEvent.category,
      year: {
        $gte: sourceEvent.year - 50,
        $lte: sourceEvent.year + 50,
      },
    })
      .sort({ year: 1 })
      .limit(6);

    return NextResponse.json({
      source: {
        _id: sourceEvent._id,
        title: sourceEvent.title,
        year: sourceEvent.year,
        category: sourceEvent.category,
      },
      related,
    });
  } catch (error) {
    console.error('Error fetching related events:', error);
    return NextResponse.json({ error: 'Error fetching related events' }, { status: 500 });
  }
}
