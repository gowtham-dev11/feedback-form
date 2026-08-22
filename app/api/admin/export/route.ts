import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/auth'
import { parseMultiSelect } from '@/lib/utils'

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tripId = searchParams.get('tripId')

  try {
    const feedbacks = await prisma.feedback.findMany({
      where: tripId ? { tripId } : {},
      include: {
        student: true,
        trip: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'Trip',
      'College',
      'Student Name',
      'Email',
      'Roll Number',
      'Department',
      'Year',
      'Overall Rating',
      'IV Rating',
      'Transport Rating',
      'Food Rating',
      'Accommodation Rating',
      'Management Rating',
      'Activity Rating',
      'Safety Rating',
      'NPS',
      'Liked Most',
      'Improvement Area',
      'Learning From IV',
      'Comments',
      'Testimonial',
      'Submitted At',
    ]

    const rows = feedbacks.map((f) => [
      f.trip.name,
      f.trip.collegeName,
      f.student.name,
      f.student.email,
      f.student.rollNumber,
      f.student.department,
      f.student.year,
      f.overallRating,
      f.ivRating,
      f.transportRating,
      f.foodRating,
      f.accommodationRating,
      f.managementRating,
      f.activityRating,
      f.safetyRating,
      f.npsScore,
      parseMultiSelect(f.likedMost).join('; '),
      parseMultiSelect(f.improvementArea).join('; '),
      f.learningFromIV || '',
      f.comments || '',
      f.allowTestimonial ? (f.testimonial || '') : '[Not permitted]',
      new Date(f.createdAt).toISOString(),
    ])

    const escapeCSV = (val: any) => {
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvLines = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ]

    const csv = csvLines.join('\n')
    const tripName = tripId ? feedbacks[0]?.trip.referenceNumber || 'All' : 'All'
    const filename = `PV_Holidays_Feedback_${tripName}_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
