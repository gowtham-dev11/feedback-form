// PDF Generation for PV Holidays Feedback Reports
// Uses jsPDF with autotable for professional output

import type { Trip, Student, Feedback } from '@prisma/client'
import { calculateNPS, avg, parseMultiSelect, countOccurrences, formatRating } from './utils'

type FeedbackWithStudent = Feedback & { student: Student }
type TripWithFeedbacks = Trip & { feedbacks: FeedbackWithStudent[]; students: Student[] }

export async function generateFeedbackPDF(tripData: TripWithFeedbacks): Promise<Buffer> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const feedbacks = tripData.feedbacks
  const totalStudents = tripData.students.length
  const totalFeedbacks = feedbacks.length

  // ---- Colors ----
  const NAVY = [15, 43, 84] as [number, number, number]
  const BLUE = [37, 99, 235] as [number, number, number]
  const LIGHT_BLUE = [219, 234, 254] as [number, number, number]
  const WHITE = [255, 255, 255] as [number, number, number]
  const GRAY = [107, 114, 128] as [number, number, number]
  const LIGHT_GRAY = [249, 250, 251] as [number, number, number]

  let yPos = 0

  // ---- HEADER ----
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 210, 45, 'F')

  doc.setTextColor(...WHITE)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('PV HOLIDAYS', 105, 16, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('INDUSTRIAL VISIT FEEDBACK REPORT', 105, 25, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(180, 200, 240)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 105, 33, { align: 'center' })
  doc.text(`Ref: ${tripData.referenceNumber}`, 105, 39, { align: 'center' })

  yPos = 55

  // ---- TRIP INFORMATION ----
  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TRIP INFORMATION', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 6

  const tripInfo = [
    ['Trip Name', tripData.name],
    ['Reference Number', tripData.referenceNumber],
    ['College Name', tripData.collegeName],
    ['Destination', tripData.destination],
    ['Start Date', new Date(tripData.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['End Date', new Date(tripData.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
  ]

  autoTable(doc, {
    startY: yPos,
    body: tripInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: NAVY, cellWidth: 50 },
      1: { textColor: [30, 30, 30] },
    },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 12

  // ---- SUMMARY STATISTICS ----
  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SUMMARY STATISTICS', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 8

  // Summary boxes
  const responseRate = totalStudents > 0 ? Math.round((totalFeedbacks / totalStudents) * 100) : 0
  const npsScores = feedbacks.map((f) => f.npsScore)
  const npsData = calculateNPS(npsScores)

  const avgOverall = avg(feedbacks.map((f) => f.overallRating))
  const avgIV = avg(feedbacks.map((f) => f.ivRating))

  const summaryBoxes = [
    { label: 'Total Students', value: totalStudents.toString() },
    { label: 'Total Responses', value: totalFeedbacks.toString() },
    { label: 'Response Rate', value: `${responseRate}%` },
    { label: 'NPS Score', value: npsData.nps.toString() },
  ]

  const boxWidth = 42
  const boxHeight = 20
  const boxGap = 6
  let bx = 14
  for (const box of summaryBoxes) {
    doc.setFillColor(...LIGHT_BLUE)
    doc.roundedRect(bx, yPos, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(...NAVY)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(box.value, bx + boxWidth / 2, yPos + 11, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(box.label, bx + boxWidth / 2, yPos + 17, { align: 'center' })
    bx += boxWidth + boxGap
  }

  yPos += boxHeight + 12

  // ---- RATINGS TABLE ----
  if (totalFeedbacks === 0) {
    doc.setTextColor(...GRAY)
    doc.setFontSize(11)
    doc.text('No feedback has been submitted for this trip yet.', 105, yPos, { align: 'center' })
    addFooter(doc, NAVY, WHITE)
    return Buffer.from(doc.output('arraybuffer'))
  }

  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RATING SUMMARY', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 4

  const ratingRows = [
    ['Overall Experience', formatRating(avgOverall), getStars(avgOverall)],
    ['Industrial Visit', formatRating(avgIV), getStars(avgIV)],
    ['Transportation', formatRating(avg(feedbacks.map((f) => f.transportRating))), getStars(avg(feedbacks.map((f) => f.transportRating)))],
    ['Food & Meals', formatRating(avg(feedbacks.map((f) => f.foodRating))), getStars(avg(feedbacks.map((f) => f.foodRating)))],
    ['Accommodation', formatRating(avg(feedbacks.map((f) => f.accommodationRating))), getStars(avg(feedbacks.map((f) => f.accommodationRating)))],
    ['Tour Management', formatRating(avg(feedbacks.map((f) => f.managementRating))), getStars(avg(feedbacks.map((f) => f.managementRating)))],
    ['Activities', formatRating(avg(feedbacks.map((f) => f.activityRating))), getStars(avg(feedbacks.map((f) => f.activityRating)))],
    ['Safety', formatRating(avg(feedbacks.map((f) => f.safetyRating))), getStars(avg(feedbacks.map((f) => f.safetyRating)))],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Average Rating', 'Score']],
    body: ratingRows,
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: WHITE, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: 'center' },
      2: { cellWidth: 42, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 12

  // ---- NPS ----
  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('NET PROMOTER SCORE (NPS)', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 8

  const npsBoxes = [
    { label: 'NPS Score', value: npsData.nps.toString(), color: BLUE as [number, number, number] },
    { label: 'Promoters (9–10)', value: `${npsData.promoterPct}%`, color: [34, 197, 94] as [number, number, number] },
    { label: 'Passives (7–8)', value: `${npsData.passivePct}%`, color: [234, 179, 8] as [number, number, number] },
    { label: 'Detractors (0–6)', value: `${npsData.detractorPct}%`, color: [239, 68, 68] as [number, number, number] },
  ]

  bx = 14
  for (const box of npsBoxes) {
    doc.setFillColor(box.color[0], box.color[1], box.color[2])
    doc.roundedRect(bx, yPos, boxWidth, boxHeight, 3, 3, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(box.value, bx + boxWidth / 2, yPos + 11, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(box.label, bx + boxWidth / 2, yPos + 17, { align: 'center' })
    bx += boxWidth + boxGap
  }

  yPos += boxHeight + 14

  // ---- WHAT STUDENTS LIKED MOST ----
  if (yPos > 230) { doc.addPage(); yPos = 20 }

  const likedItems = feedbacks.map((f) => parseMultiSelect(f.likedMost))
  const likedCounts = countOccurrences(likedItems)
  const likedSorted = Object.entries(likedCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('WHAT STUDENTS LIKED MOST', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 4

  if (likedSorted.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Activity / Aspect', 'Count', 'Percentage']],
      body: likedSorted.map(([label, count]) => [label, count.toString(), `${Math.round((count / totalFeedbacks) * 100)}%`]),
      theme: 'striped',
      headStyles: { fillColor: NAVY, textColor: WHITE, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: 14, right: 14 },
    })
    yPos = (doc as any).lastAutoTable.finalY + 12
  } else {
    doc.setTextColor(...GRAY)
    doc.setFontSize(10)
    doc.text('No data available.', 14, yPos + 6)
    yPos += 14
  }

  // ---- IMPROVEMENT AREAS ----
  if (yPos > 230) { doc.addPage(); yPos = 20 }

  const impItems = feedbacks.map((f) => parseMultiSelect(f.improvementArea))
  const impCounts = countOccurrences(impItems)
  const impSorted = Object.entries(impCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('IMPROVEMENT AREAS', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 4

  if (impSorted.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Area', 'Count', 'Percentage']],
      body: impSorted.map(([label, count]) => [label, count.toString(), `${Math.round((count / totalFeedbacks) * 100)}%`]),
      theme: 'striped',
      headStyles: { fillColor: NAVY, textColor: WHITE, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: 14, right: 14 },
    })
    yPos = (doc as any).lastAutoTable.finalY + 12
  } else {
    doc.setTextColor(...GRAY)
    doc.setFontSize(10)
    doc.text('No improvement areas reported.', 14, yPos + 6)
    yPos += 14
  }

  // ---- LEARNING FROM IV ----
  if (yPos > 230) { doc.addPage(); yPos = 20 }

  const learnings = feedbacks
    .map((f) => f.learningFromIV)
    .filter((l): l is string => Boolean(l && l.trim()))
    .slice(0, 8)

  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('LEARNING FROM INDUSTRIAL VISIT', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 6

  if (learnings.length > 0) {
    for (let i = 0; i < learnings.length; i++) {
      if (yPos > 260) { doc.addPage(); yPos = 20 }
      doc.setFontSize(9)
      doc.setTextColor(50, 50, 50)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(`${i + 1}. "${learnings[i]}"`, 178)
      doc.text(lines, 14, yPos)
      yPos += lines.length * 5 + 3
    }
    yPos += 6
  } else {
    doc.setTextColor(...GRAY)
    doc.setFontSize(10)
    doc.text('No learning responses provided.', 14, yPos)
    yPos += 14
  }

  // ---- STUDENT COMMENTS ----
  if (yPos > 220) { doc.addPage(); yPos = 20 }

  const comments = feedbacks
    .map((f) => f.comments)
    .filter((c): c is string => Boolean(c && c.trim()))
    .slice(0, 6)

  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('STUDENT COMMENTS', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 6

  if (comments.length > 0) {
    for (let i = 0; i < comments.length; i++) {
      if (yPos > 260) { doc.addPage(); yPos = 20 }
      doc.setFontSize(9)
      doc.setTextColor(50, 50, 50)
      const lines = doc.splitTextToSize(`${i + 1}. "${comments[i]}"`, 178)
      doc.text(lines, 14, yPos)
      yPos += lines.length * 5 + 3
    }
    yPos += 6
  } else {
    doc.setTextColor(...GRAY)
    doc.setFontSize(10)
    doc.text('No additional comments were provided.', 14, yPos)
    yPos += 14
  }

  // ---- TESTIMONIALS ----
  if (yPos > 220) { doc.addPage(); yPos = 20 }

  const testimonials = feedbacks
    .filter((f) => f.allowTestimonial && f.testimonial && f.testimonial.trim())
    .map((f) => ({ testimonial: f.testimonial!, name: f.student.name, dept: f.student.department }))
    .slice(0, 5)

  doc.setTextColor(...NAVY)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('STUDENT TESTIMONIALS', 14, yPos)
  yPos += 2

  doc.setFillColor(...BLUE)
  doc.rect(14, yPos, 182, 0.5, 'F')
  yPos += 6

  if (testimonials.length > 0) {
    for (const t of testimonials) {
      if (yPos > 255) { doc.addPage(); yPos = 20 }
      doc.setFillColor(...LIGHT_BLUE)
      const lines = doc.splitTextToSize(`"${t.testimonial}"`, 170)
      const boxH = lines.length * 5 + 12
      doc.roundedRect(14, yPos, 182, boxH, 2, 2, 'F')
      doc.setTextColor(30, 30, 80)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(lines, 19, yPos + 7)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...NAVY)
      doc.text(`— ${t.name}, ${t.dept}`, 19, yPos + boxH - 3)
      yPos += boxH + 6
    }
  } else {
    doc.setTextColor(...GRAY)
    doc.setFontSize(10)
    doc.text('No testimonials available.', 14, yPos)
    yPos += 14
  }

  addFooter(doc, NAVY, WHITE)

  const buffer = Buffer.from(doc.output('arraybuffer'))
  return buffer
}

function getStars(rating: number | null): string {
  if (rating === null) return 'N/A'
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

function addFooter(doc: any, navy: [number, number, number], white: [number, number, number]) {
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...navy)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setTextColor(...white)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('PV Holidays | Industrial Visit Feedback Report | Chennai, India', 105, 291, { align: 'center' })
    doc.text(`Page ${i} of ${pageCount}`, 196, 291, { align: 'right' })
  }
}
