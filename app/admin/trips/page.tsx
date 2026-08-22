'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Download, QrCode, MapPin, Copy, Loader2, Check, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react'

interface Trip {
  id: string
  name: string
  referenceNumber: string
  collegeName: string
  destination: string
  startDate: string
  endDate: string
  isActive: boolean
  feedbackCode: string
  _count: { feedbacks: number; students: number }
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/trips')
    if (res.ok) setTrips(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function getFeedbackUrl(code: string) {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    return `${base}/feedback/${code}`
  }

  async function copyLink(code: string) {
    await navigator.clipboard.writeText(getFeedbackUrl(code))
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function toggleStatus(trip: Trip) {
    const res = await fetch(`/api/admin/trips/${trip.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !trip.isActive }),
    })
    if (res.ok) load()
  }

  async function deleteTrip(id: string) {
    if (!confirm('Are you sure you want to delete this trip? This will also delete all associated students and feedback.')) return
    setDeletingId(id)
    await fetch(`/api/admin/trips/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    load()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="text-gray-500 text-sm mt-1">{trips.length} total trips</p>
        </div>
        <Link
          href="/admin/trips/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Link>
      </div>

      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{trip.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      trip.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {trip.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.destination}</span>
                    <span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{trip.referenceNumber}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{trip.collegeName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{trip._count.feedbacks}</p>
                  <p className="text-xs text-gray-400">/ {trip._count.students} responses</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                <Link
                  href={`/admin/trips/${trip.id}`}
                  className="flex items-center gap-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" /> View
                </Link>
                <Link
                  href={`/admin/trips/${trip.id}?tab=qr`}
                  className="flex items-center gap-1.5 text-sm bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <QrCode className="w-4 h-4" /> QR Code
                </Link>
                <button
                  onClick={() => copyLink(trip.feedbackCode)}
                  className="flex items-center gap-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedId === trip.feedbackCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copiedId === trip.feedbackCode ? 'Copied!' : 'Copy Link'}
                </button>
                {trip._count.feedbacks > 0 && (
                  <a
                    href={`/api/reports/trips/${trip.id}/pdf`}
                    className="flex items-center gap-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> PDF Report
                  </a>
                )}
                <a
                  href={`/api/admin/export?tripId=${trip.id}`}
                  className="flex items-center gap-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> CSV
                </a>
                <button
                  onClick={() => toggleStatus(trip)}
                  className="flex items-center gap-1.5 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {trip.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                  {trip.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteTrip(trip.id)}
                  disabled={deletingId === trip.id}
                  className="flex items-center gap-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                >
                  {deletingId === trip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {trips.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No trips yet. Create your first trip!</p>
            <Link href="/admin/trips/new" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Create Trip
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
