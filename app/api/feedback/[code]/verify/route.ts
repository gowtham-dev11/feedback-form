import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  try {
    const body = await request.json()
    const { rollNumber } = body

    if (!rollNumber) {
      return NextResponse.json({ error: 'Roll number is required' }, { status: 400 })
    }

    // Find trip
    const trip = await prisma.trip.findUnique({
      where: { feedbackCode: code.toUpperCase() },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    if (!trip.isActive) {
      return NextResponse.json({ error: 'Trip feedback is no longer active' }, { status: 403 })
    }

    // Find student
    const student = await prisma.student.findFirst({
      where: {
        tripId: trip.id,
        rollNumber: rollNumber.trim().toUpperCase(),
      },
    })

    if (!student) {
      return NextResponse.json({ 
        error: 'Roll number not found. Please check your roll number or contact your tour coordinator.',
        valid: false
      }, { status: 404 })
    }

    // Check for existing feedback
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        tripId: trip.id,
        studentId: student.id,
      },
    })

    if (existingFeedback) {
      return NextResponse.json({ 
        error: 'You have already submitted feedback for this trip. Thank you!',
        alreadySubmitted: true
      }, { status: 409 })
    }

    return NextResponse.json({ 
      valid: true,
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        year: student.year,
        collegeName: student.collegeName,
      }
    })
  } catch (error) {
    console.error('Error verifying roll number:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
