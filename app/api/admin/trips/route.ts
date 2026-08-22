import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/auth'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const trips = await prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { students: true, feedbacks: true } },
      },
    })
    return NextResponse.json(trips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, referenceNumber, collegeName, destination, description, startDate, endDate, feedbackCode, isActive } = body

    if (!name || !referenceNumber || !collegeName || !destination || !startDate || !endDate || !feedbackCode) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    const trip = await prisma.trip.create({
      data: {
        name: name.trim(),
        referenceNumber: referenceNumber.trim().toUpperCase(),
        collegeName: collegeName.trim(),
        destination: destination.trim(),
        description: description?.trim() || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        feedbackCode: feedbackCode.trim().toUpperCase(),
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(trip, { status: 201 })
  } catch (error: any) {
    console.error('Error creating trip:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Feedback code or reference number already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}
