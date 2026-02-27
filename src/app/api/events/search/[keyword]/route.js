import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { keyword } = await params;
    
    const events = await Event.find({
      title: { $regex: keyword, $options: 'i' },
    });
    
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
  }
}
