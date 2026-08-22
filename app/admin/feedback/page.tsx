'use client'

import { Suspense, Fragment } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, Star, Loader2, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { parseMultiSelect } from '@/lib/utils'

interface FeedbackItem {
  id: string
  overallRating: number
  ivRating: number
  npsScore: number
  likedMost: string
  improvementArea: string
  learningFromIV: string
  comments: string
  testimonial: string
  allowTestimonial: boolean
  transportRating: number
  foodRating: number
  accommodationRating: number
  managementRating: number
  activityRating: number
  safetyRating: number
  createdAt: string
  student: { name: string; email: string; rollNumber: string; department: string; year: string }
  trip: { name: string; collegeName: string; destination: string }
}

interface Trip {
  id: string
  name: string
}

function FeedbackContent() {
  const searchParams = useSearchParams()
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tripFilter, setTripFilter] = useState(searchParams.get('tripId') || '')
  const [minRating, setMinRating] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (tripFilter) params.set('tripId', tripFilter)
    if (minRating) params.set('minRating', minRating)
    if (search) params.set('search', search)

    const [fRes, tRes] = await Promise.all([
      fetch(`/api/admin/feedback?${params}`),
      fetch('/api/admin/trips'),
    ])

    if (fRes.ok) {
      const data = await fRes.json()
      setFeedbacks(data.feedbacks)
    }
    if (tRes.ok) setTrips(await tRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [tripFilter, minRating])

  function Stars({ rating }: { rating: number }) {
    const full = Math.round(rating)
    return (
      <span className="text-amber-500 text-sm">
        {'★'.repeat(full)}{'☆'.repeat(5 - full)} <span className="text-gray-600 font-medium">{rating}</span>
      </span>
    )
  }

  const filtered = feedbacks.filter(f =>
    !search || [f.student.name, f.student.email, f.student.rollNumber, f.student.department]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-500 text-sm">{filtered.length} responses</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/admin/export${tripFilter ? `?tripId=${tripFilter}` : ''}`}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
              placeholder="Search by name, email, roll number..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <select
            value={tripFilter}
            onChange={e => setTripFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">All Trips</option>
            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
          <button onClick={load} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Student', 'Trip', 'Overall', 'IV', 'NPS', 'Submitted', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(f => (
                  <Fragment key={f.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{f.student.name}</p>
                        <p className="text-gray-400 text-xs">{f.student.email}</p>
                        <p className="text-gray-400 text-xs">{f.student.rollNumber} · {f.student.department}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 font-medium">{f.trip.name}</p>
                        <p className="text-gray-400 text-xs">{f.trip.destination}</p>
                      </td>
                      <td className="px-4 py-3"><Stars rating={f.overallRating} /></td>
                      <td className="px-4 py-3"><Stars rating={f.ivRating} /></td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-base ${f.npsScore >= 9 ? 'text-green-600' : f.npsScore >= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {f.npsScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(f.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          {expandedId === f.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === f.id && (
                      <tr key={`${f.id}-expanded`}>
                        <td colSpan={7} className="px-4 pb-4 bg-blue-50/30">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 mt-2">
                            {[
                              { label: 'Transport', v: f.transportRating },
                              { label: 'Food', v: f.foodRating },
                              { label: 'Hotel', v: f.accommodationRating },
                              { label: 'Safety', v: f.safetyRating },
                            ].map(({ label, v }) => (
                              <div key={label} className="bg-white rounded-xl p-2 text-center border border-gray-100">
                                <p className="text-xs text-gray-400">{label}</p>
                                <p className="font-bold text-amber-600">{v}★</p>
                              </div>
                            ))}
                          </div>
                          {f.likedMost && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-semibold">Liked:</span> {parseMultiSelect(f.likedMost).join(', ')}
                            </p>
                          )}
                          {f.improvementArea && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-semibold">Improve:</span> {parseMultiSelect(f.improvementArea).join(', ')}
                            </p>
                          )}
                          {f.learningFromIV && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-semibold">Learning:</span> {f.learningFromIV}
                            </p>
                          )}
                          {f.comments && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-semibold">Comments:</span> {f.comments}
                            </p>
                          )}
                          {f.testimonial && (
                            <p className={`text-xs mt-1 p-2 rounded-lg ${f.allowTestimonial ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50 text-gray-500'}`}>
                              <span className="font-semibold">{f.allowTestimonial ? '✓ Testimonial (permitted):' : 'Testimonial (not permitted):'}</span> "{f.testimonial}"
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No feedback found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center h-64 items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  )
}
