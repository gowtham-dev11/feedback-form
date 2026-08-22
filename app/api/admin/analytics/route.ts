import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/auth'
import { calculateNPS, avg, parseMultiSelect, countOccurrences } from '@/lib/utils'

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tripId = searchParams.get('tripId')

  try {
    const where = tripId ? { tripId } : {}

    const [trips, totalStudents, feedbacks] = await Promise.all([
      prisma.trip.count(),
      prisma.student.count({ where: tripId ? { tripId } : {} }),
      prisma.feedback.findMany({
        where,
        select: {
          overallRating: true,
          ivRating: true,
          transportRating: true,
          accommodationRating: true,
          foodRating: true,
          managementRating: true,
          activityRating: true,
          safetyRating: true,
          npsScore: true,
          likedMost: true,
          improvementArea: true,
          createdAt: true,
        },
      }),
    ])

    const totalFeedbacks = feedbacks.length
    const npsData = calculateNPS(feedbacks.map((f) => f.npsScore))

    // Rating distributions (1-5)
    const ratingDist = (field: keyof typeof feedbacks[0]) => {
      const dist = [0, 0, 0, 0, 0] // index = rating-1
      feedbacks.forEach((f) => {
        const val = Math.round(f[field] as number)
        if (val >= 1 && val <= 5) dist[val - 1]++
      })
      return dist.map((count, i) => ({ rating: i + 1, count }))
    }

    // Liked most counts
    const likedItems = feedbacks.map((f) => parseMultiSelect(f.likedMost))
    const likedCounts = countOccurrences(likedItems)

    // Improvement areas counts
    const impItems = feedbacks.map((f) => parseMultiSelect(f.improvementArea))
    const impCounts = countOccurrences(impItems)

    // NPS distribution
    const npsDist = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: feedbacks.filter((f) => f.npsScore === i).length,
    }))

    // Recent feedback dates
    const recentFeedback = feedbacks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((f) => ({ createdAt: f.createdAt }))

    return NextResponse.json({
      summary: {
        totalTrips: trips,
        totalStudents,
        totalFeedbacks,
        responseRate: totalStudents > 0 ? Math.round((totalFeedbacks / totalStudents) * 100) : 0,
        avgOverallRating: avg(feedbacks.map((f) => f.overallRating)),
        avgIvRating: avg(feedbacks.map((f) => f.ivRating)),
        avgTransportRating: avg(feedbacks.map((f) => f.transportRating)),
        avgAccommodationRating: avg(feedbacks.map((f) => f.accommodationRating)),
        avgFoodRating: avg(feedbacks.map((f) => f.foodRating)),
        avgManagementRating: avg(feedbacks.map((f) => f.managementRating)),
        avgActivityRating: avg(feedbacks.map((f) => f.activityRating)),
        avgSafetyRating: avg(feedbacks.map((f) => f.safetyRating)),
        nps: npsData,
      },
      charts: {
        overallDist: ratingDist('overallRating'),
        ivDist: ratingDist('ivRating'),
        npsDist,
        likedCounts: Object.entries(likedCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => ({ label, count, pct: Math.round((count / totalFeedbacks) * 100) })),
        impCounts: Object.entries(impCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => ({ label, count, pct: Math.round((count / totalFeedbacks) * 100) })),
        ratingComparison: [
          { name: 'Overall', avg: avg(feedbacks.map((f) => f.overallRating)) },
          { name: 'IV', avg: avg(feedbacks.map((f) => f.ivRating)) },
          { name: 'Transport', avg: avg(feedbacks.map((f) => f.transportRating)) },
          { name: 'Food', avg: avg(feedbacks.map((f) => f.foodRating)) },
          { name: 'Hotel', avg: avg(feedbacks.map((f) => f.accommodationRating)) },
          { name: 'Mgmt', avg: avg(feedbacks.map((f) => f.managementRating)) },
          { name: 'Activities', avg: avg(feedbacks.map((f) => f.activityRating)) },
          { name: 'Safety', avg: avg(feedbacks.map((f) => f.safetyRating)) },
        ],
      },
      recentFeedback,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
