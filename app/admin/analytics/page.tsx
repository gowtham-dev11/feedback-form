'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'
import { Loader2, Download, RefreshCw } from 'lucide-react'

interface AnalyticsData {
  summary: {
    totalTrips: number
    totalStudents: number
    totalFeedbacks: number
    responseRate: number
    avgOverallRating: number | null
    avgIvRating: number | null
    nps: { nps: number; promoterPct: number; passivePct: number; detractorPct: number }
  }
  charts: {
    overallDist: { rating: number; count: number }[]
    ivDist: { rating: number; count: number }[]
    npsDist: { score: number; count: number }[]
    likedCounts: { label: string; count: number; pct: number }[]
    impCounts: { label: string; count: number; pct: number }[]
    ratingComparison: { name: string; avg: number | null }[]
  }
}

interface Trip { id: string; name: string }

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#6366f1', '#f59e0b']
const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Average', 4: 'Good', 5: 'Excellent' }

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripId, setTripId] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = tripId ? `?tripId=${tripId}` : ''
    const [aRes, tRes] = await Promise.all([
      fetch(`/api/admin/analytics${params}`),
      fetch('/api/admin/trips'),
    ])
    if (aRes.ok) setData(await aRes.json())
    if (tRes.ok) setTrips(await tRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [tripId])

  if (loading && !data) {
    return (
      <div className="flex justify-center h-64 items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const s = data?.summary
  const c = data?.charts

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm">Calculated from {s?.totalFeedbacks ?? 0} feedback responses</p>
        </div>
        <div className="flex gap-2">
          <select
            value={tripId}
            onChange={e => setTripId(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">All Trips</option>
            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={load} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          {tripId && (
            <a
              href={`/api/reports/trips/${tripId}/pdf`}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Download className="w-4 h-4" /> PDF Report
            </a>
          )}
        </div>
      </div>

      {!s || s.totalFeedbacks === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No feedback data available{tripId ? ' for this trip' : ''}.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary stat bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Overall Rating', value: s.avgOverallRating ? `${s.avgOverallRating} / 5` : 'N/A' },
              { label: 'IV Rating', value: s.avgIvRating ? `${s.avgIvRating} / 5` : 'N/A' },
              { label: 'NPS Score', value: s.nps.nps },
              { label: 'Response Rate', value: `${s.responseRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Rating comparison radar/bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service ratings comparison */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Service Rating Comparison</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={(c?.ratingComparison || []).map(d => ({ ...d, avg: d.avg ?? 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [typeof v === 'number' ? v.toFixed(1) : v, 'Avg Rating']} />
                  <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* NPS distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">NPS Score Distribution</h3>
              <div className="flex gap-3 mb-4">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Promoters {s.nps.promoterPct}%</span>
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Passives {s.nps.passivePct}%</span>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Detractors {s.nps.detractorPct}%</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={c?.npsDist || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(c?.npsDist || []).map((entry, idx) => (
                      <Cell key={idx} fill={entry.score >= 9 ? '#059669' : entry.score >= 7 ? '#d97706' : '#dc2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overall rating distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Overall Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={c?.overallDist.map(d => ({ ...d, label: RATING_LABELS[d.rating as keyof typeof RATING_LABELS] })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">IV Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={c?.ivDist.map(d => ({ ...d, label: RATING_LABELS[d.rating as keyof typeof RATING_LABELS] })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* What students liked most */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">What Students Liked Most</h3>
              {(c?.likedCounts || []).length > 0 ? (
                <div className="space-y-2">
                  {c?.likedCounts.slice(0, 8).map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24 truncate font-medium">{item.label}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${item.pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        >
                          <span className="text-white text-xs font-bold">{item.pct}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No data</p>}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Improvement Areas</h3>
              {(c?.impCounts || []).length > 0 ? (
                <div className="space-y-2">
                  {c?.impCounts.slice(0, 8).map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24 truncate font-medium">{item.label}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${item.pct || 5}%`, backgroundColor: '#f97316' }}
                        >
                          <span className="text-white text-xs font-bold">{item.pct}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No data</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
