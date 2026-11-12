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
    
    const rawPage = parseInt(searchParams.get('page') || '1');
    const rawLimit = parseInt(searchParams.get('limit') || '100');
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 10000)
      : 100;
    const startYear = searchParams.get('startYear');
    const endYear = searchParams.get('endYear');
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;
    const query = { coordinates: { $ne: null } };

    if (startYear && endYear) {
      const yearFilter = {
        $gte: Number(startYear),
        $lte: Number(endYear),
      };

      if (category) {
        // Holidays and other date-based records can have no year. Keep them
        // visible when a category filter is active instead of silently
        // dropping them from the map.
        query.$or = [{ year: yearFilter }, { year: null }];
      } else {
        query.year = yearFilter;
      }
    }

    if (category) {
      const categories = category
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

      if (categories.length === 1) {
        query.category = categories[0];
      } else if (categories.length > 1) {
        query.category = { $in: categories };
      }
    }

    const events = await Event.find(query).skip(skip).limit(limit);
    const totalEvents = await Event.countDocuments(query);

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
