'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    referenceNumber: '',
    collegeName: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    feedbackCode: '',
    isActive: true,
  })

  function setField(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // Auto-generate feedback code from trip name
  function generateCode() {
    const code = form.name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .filter(Boolean)
      .map(w => w.slice(0, 4).toUpperCase())
      .join('')
      .slice(0, 10)
    setField('feedbackCode', code + new Date().getFullYear())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          referenceNumber: form.referenceNumber.toUpperCase(),
          feedbackCode: form.feedbackCode.toUpperCase(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create trip')
      } else {
        router.push(`/admin/trips/${data.id}`)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/trips" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
          <p className="text-gray-500 text-sm">Set up a new industrial visit trip</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Trip Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Kochi College Tour"
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reference Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.referenceNumber}
              onChange={e => setField('referenceNumber', e.target.value)}
              placeholder="e.g. PVHT0001977"
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">College Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.collegeName}
              onChange={e => setField('collegeName', e.target.value)}
              placeholder="e.g. ABC Engineering College"
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Destination <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.destination}
              onChange={e => setField('destination', e.target.value)}
              placeholder="e.g. Kochi, Kerala"
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setField('startDate', e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => setField('endDate', e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback Code <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.feedbackCode}
                onChange={e => setField('feedbackCode', e.target.value)}
                placeholder="e.g. KOCHI2026"
                required
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none uppercase"
              />
              <button
                type="button"
                onClick={generateCode}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Auto-generate
              </button>
            </div>
            {form.feedbackCode && (
              <p className="text-xs text-gray-400 mt-1">
                Feedback URL: /feedback/{form.feedbackCode.toUpperCase()}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              rows={3}
              placeholder="Trip itinerary, highlights, included services..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setField('isActive', !form.isActive)}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {form.isActive ? 'Active – Students can submit feedback' : 'Inactive – Feedback form disabled'}
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/admin/trips" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-center transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Save className="w-4 h-4" /> Create Trip</>}
          </button>
        </div>
      </form>
    </div>
  )
}
