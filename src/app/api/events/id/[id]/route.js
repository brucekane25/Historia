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
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching event by ID' }, { status: 500 });
  }
}
