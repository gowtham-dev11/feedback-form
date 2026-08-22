import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.feedback.deleteMany()
  await prisma.student.deleteMany()
  await prisma.trip.deleteMany()

  // Create demo trip
  const trip = await prisma.trip.create({
    data: {
      name: 'Kochi College Tour',
      referenceNumber: 'PVHT0001977',
      collegeName: 'Demo Engineering College',
      destination: 'Kochi, Kerala',
      description:
        'An exciting 3-day industrial visit and sightseeing tour to Kochi including Industrial Visit, Wonderla, Marine Drive DJ Boating, Vypin Beach, Fort Kochi, Chinese Fishing Nets, Vasco Da Gama Square, Dutch Cemetery, Jew Town & Shopping, hotel accommodation, meals, transportation, and a dedicated tour manager.',
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-08-22'),
      feedbackCode: 'KOCHI2026',
      isActive: true,
    },
  })

  console.log('✅ Created trip:', trip.name, '–', trip.feedbackCode)

  // Create 20 demo students
  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE']
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']

  const students = []
  for (let i = 1; i <= 20; i++) {
    const padded = String(i).padStart(2, '0')
    const dept = departments[(i - 1) % departments.length]
    const year = years[(i - 1) % years.length]
    const student = await prisma.student.create({
      data: {
        name: `Demo Student ${padded}`,
        email: `student${padded}@example.com`,
        rollNumber: `2024${dept}${padded}`,
        department: dept,
        year,
        collegeName: 'Demo Engineering College',
        tripId: trip.id,
      },
    })
    students.push(student)
  }
  console.log('✅ Created 20 demo students')

  // Liked items and improvement areas options
  const likedOptions = [
    'Industrial Visit',
    'Wonderla',
    'Boating',
    'Sightseeing',
    'Food',
    'Transportation',
    'Hotel',
    'Tour Management',
    'Group Experience',
  ]
  const impOptions = [
    'Transportation',
    'Food',
    'Accommodation',
    'Time Management',
    'Tour Management',
    'Activities',
    'Nothing',
  ]

  const learnings = [
    'Learned how real-world production systems work.',
    'Understood industrial automation and manufacturing processes.',
    'Got practical exposure related to our course curriculum.',
    'Saw how theoretical concepts are applied in industry.',
    'Understood quality control and production management.',
    'Learned about team coordination in large industrial setups.',
    'Got insights into career opportunities in the manufacturing sector.',
    'Observed safety protocols followed in industrial environments.',
    'Understood supply chain and logistics management.',
    'Learned how modern machinery is operated and maintained.',
    'Gained perspective on the gap between education and industry.',
    'Saw how R&D works in a real company environment.',
    'Understood how engineers collaborate across departments.',
    'Learned about environmental compliance in industries.',
    'Got a clear picture of production floor operations.',
    'Observed how automation reduces manual errors.',
    'Learned about ERP systems and digital manufacturing.',
    'Understood the importance of precision in engineering.',
    'Gained knowledge about energy-efficient manufacturing.',
    'Learned about product lifecycle from design to delivery.',
  ]

  const comments = [
    'The trip was very well organized. Loved every moment!',
    'The industrial visit was eye-opening. Highly recommend it to juniors.',
    'Food was good but could be improved.',
    'Tour manager was very helpful and knowledgeable.',
    'Wonderla was amazing! Best part of the trip.',
    'The hotel was comfortable and clean.',
    'Transportation was smooth and on time throughout.',
    'Fort Kochi was beautiful – loved the colonial architecture.',
    'Marine Drive boating experience was unforgettable.',
    'A fantastic trip overall. Looking forward to the next one.',
    'The itinerary was packed but manageable. No complaints!',
    'Very well organized. PV Holidays did a great job.',
    'Learned a lot during the industrial visit. Worth it!',
    'The beach visit was refreshing and enjoyable.',
    null, null, null, null, null, null,
  ]

  const testimonials = [
    'PV Holidays organized an incredible trip to Kochi! The industrial visit was both educational and inspiring. The team was professional and attentive throughout.',
    'Best college trip ever! The combination of industrial exposure and sightseeing made this trip truly memorable. Highly recommend PV Holidays!',
    'The tour manager was exceptional – always helpful and ensuring everyone was comfortable. Kochi is beautiful and the trip was flawlessly organized.',
    'From Wonderla to the industrial visit, every aspect of the trip was thoughtfully planned. PV Holidays exceeded our expectations!',
    'A well-structured trip with the perfect blend of learning and fun. Will definitely book PV Holidays for future college tours.',
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ]

  // Create feedback for all 20 students
  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    const seed = i + 1

    // Randomize ratings with realistic variation
    const overallRating = 3.5 + (seed % 3) * 0.5  // 3.5, 4.0, 4.5
    const ivRating = 4.0 + (seed % 3) * 0.3
    const transportRating = 3.5 + (seed % 4) * 0.3
    const foodRating = 3.5 + (seed % 3) * 0.4
    const accommodationRating = 4.0 + (seed % 2) * 0.5
    const managementRating = 4.0 + (seed % 3) * 0.3
    const activityRating = 4.0 + (seed % 2) * 0.5
    const safetyRating = 4.5 - (seed % 2) * 0.3

    // NPS score
    const npsScore = seed % 3 === 0 ? 10 : seed % 3 === 1 ? 8 : 5

    // Liked most – pick 2-4 items
    const liked = likedOptions.filter((_, idx) => (idx + seed) % 3 !== 0).slice(0, 4).join(',')

    // Improvement areas – pick 1-2 items
    const improvement = impOptions.filter((_, idx) => (idx + seed) % 5 === 0).slice(0, 2).join(',') || 'Nothing'

    const allowTest = i < 5  // first 5 allow testimonials
    const testimonial = testimonials[i] || null

    await prisma.feedback.create({
      data: {
        tripId: trip.id,
        studentId: student.id,
        overallRating: Math.min(5, Math.max(1, Math.round(overallRating * 10) / 10)),
        ivRating: Math.min(5, Math.max(1, Math.round(ivRating * 10) / 10)),
        transportRating: Math.min(5, Math.max(1, Math.round(transportRating * 10) / 10)),
        accommodationRating: Math.min(5, Math.max(1, Math.round(accommodationRating * 10) / 10)),
        foodRating: Math.min(5, Math.max(1, Math.round(foodRating * 10) / 10)),
        managementRating: Math.min(5, Math.max(1, Math.round(managementRating * 10) / 10)),
        activityRating: Math.min(5, Math.max(1, Math.round(activityRating * 10) / 10)),
        safetyRating: Math.min(5, Math.max(1, Math.round(safetyRating * 10) / 10)),
        npsScore,
        likedMost: liked,
        improvementArea: improvement,
        learningFromIV: learnings[i],
        comments: comments[i] || null,
        testimonial,
        allowTestimonial: allowTest,
      },
    })
  }

  console.log('✅ Created 20 feedback entries')
  console.log('\n🎉 Seed complete!')
  console.log(`\nFeedback URL: /feedback/KOCHI2026`)
  console.log(`Admin URL: /admin`)
  console.log(`\nSample Roll Numbers: 2024CSE01, 2024ECE02, 2024MECH03 ...`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
