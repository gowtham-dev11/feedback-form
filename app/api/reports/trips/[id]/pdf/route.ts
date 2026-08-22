import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/auth'
import { generateFeedbackPDF } from '@/lib/pdf'

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
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    if (trip.feedbacks.length === 0) {
      return NextResponse.json(
        { error: 'No feedback has been submitted for this trip yet.' },
        { status: 400 }
      )
    }

    const pdfBuffer = await generateFeedbackPDF(trip)
    const filename = `PV_Holidays_Feedback_Report_${trip.referenceNumber}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
