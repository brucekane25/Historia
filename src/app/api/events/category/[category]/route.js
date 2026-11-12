import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

// Gloria serves this API from its own Node runtime; never pre-render it.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

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
