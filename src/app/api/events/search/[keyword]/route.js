import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

// Gloria serves this API from its own Node runtime; never pre-render it.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function relevanceScore(title, query) {
  const text = (title || '').toLowerCase();
  if (!text) return 0;

  let score = 0;
  if (text === query) score += 100;
  if (text.startsWith(query)) score += 40;

  const index = text.indexOf(query);
  if (index === 0) score += 10;
  else if (index > 0) score += 4;

  const words = query.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((word) => text.includes(word))) {
    score += 8;
  }

  // Shorter titles are usually the more specific match.
  score += Math.max(0, 10 - Math.floor(text.length / 30));
  return score;
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { keyword } = await params;
    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get('limit') || '20');
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 50)
      : 20;

    const safeKeyword = (keyword || '').trim();
    if (!safeKeyword) return NextResponse.json([]);

    // Escape user input so regex characters can't break the query.
    const escaped = safeKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = safeKeyword.toLowerCase();

    const candidates = await Event.find({
      title: { $regex: escaped, $options: 'i' },
    })
      .limit(50)
      .lean();

    candidates.sort(
      (a, b) =>
        relevanceScore(b.title, query) - relevanceScore(a.title, query) ||
        (b.year || 0) - (a.year || 0)
    );

    return NextResponse.json(candidates.slice(0, limit));
  } catch (error) {
    console.error('Error searching events:', error);
    return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
  }
}
