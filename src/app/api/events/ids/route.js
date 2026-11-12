import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';
import mongoose from 'mongoose';

// Gloria serves this API from its own Node runtime; never pre-render it.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

// Batch-load saved events so bookmarks survive filters and page changes.
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const ids = (searchParams.get('ids') || '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .slice(0, 100);

    if (ids.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const events = await Event.find({ _id: { $in: ids } });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching bookmarked events:', error);
    return NextResponse.json(
      { error: 'Error fetching bookmarked events' },
      { status: 500 }
    );
  }
}
