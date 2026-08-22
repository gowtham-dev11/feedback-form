import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        students: true,
        feedbacks: {
          include: { student: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { students: true, feedbacks: true } },
      },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { name, referenceNumber, collegeName, destination, description, startDate, endDate, feedbackCode, isActive } = body

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(referenceNumber && { referenceNumber: referenceNumber.trim().toUpperCase() }),
        ...(collegeName && { collegeName: collegeName.trim() }),
        ...(destination && { destination: destination.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(feedbackCode && { feedbackCode: feedbackCode.trim().toUpperCase() }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(trip)
  } catch (error: any) {
    console.error('Error updating trip:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Feedback code or reference number already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.feedback.deleteMany({ where: { tripId: id } })
    await prisma.student.deleteMany({ where: { tripId: id } })
    await prisma.trip.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}
