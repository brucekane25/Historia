import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { category } = await params;
    
    const events = await Event.find({ category });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching events by category' }, { status: 500 });
  }
}
