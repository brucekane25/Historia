import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/app/models/Event';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const startYear = searchParams.get('startYear');
    const endYear = searchParams.get('endYear');

    const match = {};
    if (startYear && endYear) {
      match.year = { $gte: parseInt(startYear), $lte: parseInt(endYear) };
    }

    const pipeline = [];
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({
      $facet: {
        total: [{ $count: 'count' }],
        withCoordinates: [
          { $match: { coordinates: { $ne: null } } },
          { $count: 'count' },
        ],
        categories: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        decades: [
          {
            $group: {
              _id: { $multiply: [{ $floor: { $divide: ['$year', 10] } }, 10] },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 15 },
        ],
        centuries: [
          {
            $group: {
              _id: { $multiply: [{ $floor: { $divide: ['$year', 100] } }, 100] },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        yearRange: [
          {
            $group: {
              _id: null,
              minYear: { $min: '$year' },
              maxYear: { $max: '$year' },
            },
          },
        ],
      },
    });

    const [result] = await Event.aggregate(pipeline);

    const stats = {
      totalEvents: result.total[0]?.count || 0,
      withCoordinates: result.withCoordinates[0]?.count || 0,
      categories: result.categories.map((c) => ({
        category: c._id,
        count: c.count,
      })),
      topDecades: result.decades.map((d) => ({
        decade: d._id,
        count: d.count,
      })),
      centuries: result.centuries.map((c) => ({
        century: c._id,
        count: c.count,
      })),
      yearRange: {
        min: result.yearRange[0]?.minYear || 0,
        max: result.yearRange[0]?.maxYear || 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
  }
}
