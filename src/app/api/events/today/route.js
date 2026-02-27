import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

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

    // Match titles containing "January 5" or "5 January" etc.
    const regex = new RegExp(`(${month}\\s+${day}\\b|\\b${day}\\s+${month})`, 'i');

    const events = await Event.find({ title: { $regex: regex } })
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
