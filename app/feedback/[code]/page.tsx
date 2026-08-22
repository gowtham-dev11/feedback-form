'use client'

import { useState, useEffect, use } from 'react'
import { StarRating } from '@/components/ui/StarRating'
import { NPSSelector } from '@/components/ui/NPSSelector'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { validateEmail } from '@/lib/utils'
import { CheckCircle, Loader2, AlertCircle, MapPin, Calendar, Building2, ChevronRight, ChevronLeft } from 'lucide-react'

interface Trip {
  id: string
  name: string
  referenceNumber: string
  collegeName: string
  destination: string
  description: string
  startDate: string
  endDate: string
  feedbackCode: string
}

const LIKED_OPTIONS = [
  'Industrial Visit', 'Wonderla', 'Boating', 'Sightseeing',
  'Food', 'Transportation', 'Hotel', 'Tour Management', 'Group Experience', 'Other'
]

const IMPROVEMENT_OPTIONS = [
  'Transportation', 'Food', 'Accommodation', 'Industrial Visit',
  'Time Management', 'Tour Management', 'Activities', 'Communication', 'Safety', 'Nothing', 'Other'
]

const DEPARTMENT_OPTIONS = [
  'CSE', 'CSBS', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'CHEM', 'AERO', 'BIO-TECH', 'MBA', 'MCA', 'Other'
]

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function FeedbackPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Student details
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [step1Error, setStep1Error] = useState('')

  // Ratings
  const [overallRating, setOverallRating] = useState(0)
  const [ivRating, setIvRating] = useState(0)
  const [transportRating, setTransportRating] = useState(0)
  const [accommodationRating, setAccommodationRating] = useState(0)
  const [foodRating, setFoodRating] = useState(0)
  const [managementRating, setManagementRating] = useState(0)
  const [activityRating, setActivityRating] = useState(0)
  const [safetyRating, setSafetyRating] = useState(0)

  // IV specific
  const [learningFromIV, setLearningFromIV] = useState('')

  // Step 4
  const [likedMost, setLikedMost] = useState<string[]>([])
  const [improvementArea, setImprovementArea] = useState<string[]>([])
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [comments, setComments] = useState('')
  const [testimonial, setTestimonial] = useState('')
  const [allowTestimonial, setAllowTestimonial] = useState(false)

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips/${code}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Trip not found')
        } else {
          const data = await res.json()
          setTrip(data)
        }
      } catch {
        setError('Failed to load trip information')
      } finally {
        setLoading(false)
      }
    }
    fetchTrip()
  }, [code])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  async function handleStep1Next() {
    setStep1Error('')
    if (!name.trim()) return setStep1Error('Full name is required')
    if (!email.trim()) return setStep1Error('Email address is required')
    if (!validateEmail(email)) return setStep1Error('Please enter a valid email address (e.g. name@example.com)')
    if (!rollNumber.trim()) return setStep1Error('Roll number is required')
    if (!department) return setStep1Error('Please select your department')
    if (!year) return setStep1Error('Please select your year')
    setStep(2)
    window.scrollTo(0, 0)
  }

  function handleStep2Next() {
    const ratings = [overallRating, ivRating, transportRating, accommodationRating, foodRating, managementRating, activityRating, safetyRating]
    if (ratings.some(r => r === 0)) {
      alert('Please rate all categories before proceeding.')
      return
    }
    setStep(3)
    window.scrollTo(0, 0)
  }

  function handleStep3Next() {
    if (!learningFromIV.trim()) {
      alert('Please share what you learned from the Industrial Visit.')
      return
    }
    setStep(4)
    window.scrollTo(0, 0)
  }

  async function handleSubmit() {
    if (npsScore === null) {
      alert('Please select your NPS score (0–10).')
      return
    }
    if (likedMost.length === 0) {
      alert('Please select at least one thing you liked most.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/feedback/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          rollNumber: rollNumber.trim().toUpperCase(),
          department,
          year,
          overallRating,
          ivRating,
          transportRating,
          accommodationRating,
          foodRating,
          managementRating,
          activityRating,
          safetyRating,
          npsScore,
          likedMost,
          improvementArea,
          learningFromIV: learningFromIV.trim(),
          comments: comments.trim() || null,
          testimonial: testimonial.trim() || null,
          allowTestimonial,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.alreadySubmitted) {
          setError(data.error)
          setSubmitted(true)
        } else {
          alert(data.error || 'Submission failed. Please try again.')
        }
      } else {
        setSubmitted(true)
      }
    } catch {
      alert('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading trip information...</p>
        </div>
      </div>
    )
  }

  if (error && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
          <p className="text-gray-600 mb-2">Your feedback has been submitted successfully.</p>
          <p className="text-gray-500 text-sm">Your feedback helps PV Holidays create better Industrial Visits and memorable trips.</p>
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
            <p className="text-blue-700 font-medium text-sm">✈️ PV Holidays</p>
            <p className="text-blue-600 text-xs mt-1">Creating memories, one trip at a time.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) return null

  const stepTitles = ['About You', 'Your Experience', 'Industrial Visit', 'Your Feedback']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✈️</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">PV HOLIDAYS</h1>
              <p className="text-blue-200 text-xs">Industrial Visit Feedback</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-1">{trip.name}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-blue-100">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {trip.collegeName}
              </span>
            </div>
            <p className="text-blue-200 text-xs mt-2 italic">Ref: {trip.referenceNumber}</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, i) => {
              const stepNum = i + 1
              return (
                <div key={stepNum} className="flex items-center">
                  <div className={`flex items-center gap-1.5 ${step === stepNum ? 'text-blue-700' : step > stepNum ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      step === stepNum ? 'bg-blue-600 border-blue-600 text-white' :
                      step > stepNum ? 'bg-green-500 border-green-500 text-white' :
                      'border-gray-300 text-gray-400'
                    }`}>
                      {step > stepNum ? '✓' : stepNum}
                    </div>
                    <span className="hidden sm:block text-xs font-medium">{title}</span>
                  </div>
                  {stepNum < 4 && <div className="w-6 sm:w-10 h-0.5 bg-gray-200 mx-1" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* STEP 1: About You */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tell Us About Yourself</h3>
            {step1Error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{step1Error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">e.g. name@college.edu or name@gmail.com</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Your roll number"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none transition-colors uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none bg-white transition-colors"
                >
                  <option value="">Select department</option>
                  {DEPARTMENT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {YEAR_OPTIONS.map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                        year === y ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={handleStep1Next}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-colors"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Ratings */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Your Experience</h3>
            <p className="text-gray-500 text-sm mb-6">Tap the stars to rate each category (1 = Poor, 5 = Excellent)</p>
            <div className="space-y-6">
              {[
                { label: '⭐ Overall Trip Experience', value: overallRating, onChange: setOverallRating },
                { label: '🏭 Industrial Visit', value: ivRating, onChange: setIvRating },
                { label: '🚌 Transportation', value: transportRating, onChange: setTransportRating },
                { label: '🍽️ Food & Meals', value: foodRating, onChange: setFoodRating },
                { label: '🏨 Accommodation / Hotel', value: accommodationRating, onChange: setAccommodationRating },
                { label: '👨‍💼 Tour Management', value: managementRating, onChange: setManagementRating },
                { label: '🎡 Activities & Sightseeing', value: activityRating, onChange: setActivityRating },
                { label: '🛡️ Safety & Security', value: safetyRating, onChange: setSafetyRating },
              ].map(({ label, value, onChange }) => (
                <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="font-semibold text-gray-800 mb-3">{label}</p>
                  <StarRating value={value} onChange={onChange} />
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => { setStep(1); window.scrollTo(0,0) }} className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleStep2Next} className="flex-2 flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Industrial Visit */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Industrial Visit Details</h3>
            <p className="text-gray-500 text-sm mb-6">Tell us about your Industrial Visit experience</p>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="font-semibold text-gray-800 mb-3">🏭 How useful was the Industrial Visit?</p>
                <StarRating value={ivRating} onChange={setIvRating} />
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <label className="block font-semibold text-gray-800 mb-2">
                  💡 What did you learn from the Industrial Visit? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={learningFromIV}
                  onChange={(e) => setLearningFromIV(e.target.value)}
                  rows={4}
                  placeholder="Share what you learned – concepts, processes, insights..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => { setStep(2); window.scrollTo(0,0) }} className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleStep3Next} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Feedback */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Feedback</h3>
            <div className="space-y-6">
              {/* What did you like most */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="font-semibold text-gray-800 mb-3">❤️ What did you like most? <span className="text-red-500">*</span></p>
                <MultiSelect options={LIKED_OPTIONS} selected={likedMost} onChange={setLikedMost} />
              </div>

              {/* Improvement areas */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="font-semibold text-gray-800 mb-3">🔧 What should PV Holidays improve?</p>
                <MultiSelect options={IMPROVEMENT_OPTIONS} selected={improvementArea} onChange={setImprovementArea} />
              </div>

              {/* NPS */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="font-semibold text-gray-800 mb-1">📊 Would you recommend PV Holidays to friends or college? <span className="text-red-500">*</span></p>
                <p className="text-sm text-gray-500 mb-3">Rate from 0 (Not likely) to 10 (Extremely likely)</p>
                <NPSSelector value={npsScore} onChange={setNpsScore} />
              </div>

              {/* Comments */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <label className="block font-semibold text-gray-800 mb-2">💬 Additional Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="Any other thoughts, suggestions, or feedback..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Testimonial */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <label className="block font-semibold text-gray-800 mb-2">⭐ Share a Short Review (Optional)</label>
                <textarea
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  rows={3}
                  placeholder="Write a short review about your PV Holidays experience..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none resize-none"
                />
                {testimonial.trim() && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Can PV Holidays use your review as a testimonial?</p>
                    <div className="flex gap-3">
                      {[true, false].map((val) => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => setAllowTestimonial(val)}
                          className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                            allowTestimonial === val
                              ? val ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-600 border-gray-600 text-white'
                              : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          {val ? '✓ Yes, use it' : '✗ No, keep it private'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => { setStep(3); window.scrollTo(0,0) }} className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Submit Feedback</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
