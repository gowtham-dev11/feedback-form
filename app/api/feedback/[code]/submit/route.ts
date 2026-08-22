import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateEmail } from '@/lib/utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  try {
    const body = await request.json()
    const {
      // Student details
      name,
      email,
      rollNumber,
      department,
      year,
      // Ratings
      overallRating,
      ivRating,
      transportRating,
      accommodationRating,
      foodRating,
      managementRating,
      activityRating,
      safetyRating,
      // NPS
      npsScore,
      // Multi-select
      likedMost,
      improvementArea,
      // Free text
      learningFromIV,
      comments,
      testimonial,
      allowTestimonial,
    } = body

    // Validate required fields
    if (!name || !email || !rollNumber || !department || !year) {
      return NextResponse.json({ error: 'All student details are required' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Validate ratings
    const ratings = [overallRating, ivRating, transportRating, accommodationRating, foodRating, managementRating, activityRating, safetyRating]
    if (ratings.some((r) => typeof r !== 'number' || r < 1 || r > 5)) {
      return NextResponse.json({ error: 'All ratings must be between 1 and 5' }, { status: 400 })
    }

    if (typeof npsScore !== 'number' || npsScore < 0 || npsScore > 10) {
      return NextResponse.json({ error: 'NPS score must be between 0 and 10' }, { status: 400 })
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

    // Find or create student
    let student = await prisma.student.findFirst({
      where: {
        tripId: trip.id,
        rollNumber: rollNumber.trim().toUpperCase(),
      },
    })

    if (!student) {
      student = await prisma.student.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          rollNumber: rollNumber.trim().toUpperCase(),
          department,
          year,
          collegeName: trip.collegeName,
          tripId: trip.id,
        },
      })
    } else {
      // Check duplicate feedback for existing student
      const existingFeedback = await prisma.feedback.findFirst({
        where: { tripId: trip.id, studentId: student.id },
      })

      if (existingFeedback) {
        return NextResponse.json({ 
          error: 'You have already submitted feedback for this trip. Thank you!',
          alreadySubmitted: true
        }, { status: 409 })
      }

      // Update student details if they provided different ones
      student = await prisma.student.update({
        where: { id: student.id },
        data: { 
          name: name.trim(),
          email: email.trim().toLowerCase(),
          department,
          year
        },
      })
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        tripId: trip.id,
        studentId: student.id,
        overallRating,
        ivRating,
        transportRating,
        accommodationRating,
        foodRating,
        managementRating,
        activityRating,
        safetyRating,
        npsScore,
        likedMost: Array.isArray(likedMost) ? likedMost.join(',') : (likedMost || ''),
        improvementArea: Array.isArray(improvementArea) ? improvementArea.join(',') : (improvementArea || ''),
        learningFromIV: learningFromIV || null,
        comments: comments || null,
        testimonial: testimonial || null,
        allowTestimonial: Boolean(allowTestimonial),
      },
    })

    return NextResponse.json({ success: true, feedbackId: feedback.id })
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'You have already submitted feedback for this trip. Thank you!',
        alreadySubmitted: true 
      }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
