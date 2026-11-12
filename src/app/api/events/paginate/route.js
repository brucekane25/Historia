import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

// Gloria serves this API from its own Node runtime; never pre-render it.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const date = searchParams.get('date');
    const year = searchParams.get('year');
    
    const filters = {};
    if (category) filters.category = category;
    if (date) filters.date = date;
    if (year) filters.year = parseInt(year);

    const skip = (page - 1) * limit;
    const events = await Event.find(filters).skip(skip).limit(limit);
    const totalEvents = await Event.countDocuments(filters);

    return NextResponse.json({
      page,
      totalPages: Math.ceil(totalEvents / limit),
      totalEvents,
      events,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching paginated events' }, { status: 500 });
  }
}
