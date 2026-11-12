import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

// Gloria serves this API from its own Node runtime; never pre-render it.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const month = MONTHS[now.getMonth()];
    const day = now.getDate();
    // The dataset stores a zero-padded MM/DD date, e.g. "11/03".
    const dateKey = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}`;

    const events = await Event.find({ date: dateKey })
      .sort({ thumbnail: -1, year: -1 })
      .limit(20);

    return NextResponse.json({
      date: `${month} ${day}`,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error fetching today events:', error);
    return NextResponse.json({ error: 'Error fetching today events' }, { status: 500 });
  }
}
