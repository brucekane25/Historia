import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const startYear = searchParams.get('startYear');
    const endYear = searchParams.get('endYear');
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;
    const query = { coordinates: { $ne: null } };

    if (startYear && endYear) {
      query.year = { $gte: Number(startYear), $lte: Number(endYear) };
    }

    const validCategories = ['selected', 'births', 'deaths', 'events', 'holidays'];
    if (category && validCategories.includes(category.toLowerCase())) {
      query.category = category.toLowerCase();
    }

    console.log('Query:', JSON.stringify(query));
    
    const events = await Event.find(query).skip(skip).limit(limit);
    const totalEvents = await Event.countDocuments(query);
    
    console.log('Found events:', totalEvents);

    return NextResponse.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
      totalEvents,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error fetching events with coordinates' }, { status: 500 });
  }
}
