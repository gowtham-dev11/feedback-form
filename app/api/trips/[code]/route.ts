import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  try {
    const trip = await prisma.trip.findUnique({
      where: { feedbackCode: code.toUpperCase() },
      select: {
        id: true,
        name: true,
        referenceNumber: true,
        collegeName: true,
        destination: true,
        description: true,
        startDate: true,
        endDate: true,
        feedbackCode: true,
        isActive: true,
      },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    if (!trip.isActive) {
      return NextResponse.json({ error: 'Trip feedback is no longer active' }, { status: 403 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 })
  }
}
