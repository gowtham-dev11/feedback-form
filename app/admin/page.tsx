'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, MessageSquare, Star, TrendingUp, MapPin, Activity,
  Loader2, BarChart2, Download, FileText
} from 'lucide-react'

interface Analytics {
  summary: {
    totalTrips: number
    totalStudents: number
    totalFeedbacks: number
    responseRate: number
    avgOverallRating: number | null
    avgIvRating: number | null
    nps: { nps: number; promoterPct: number; passivePct: number; detractorPct: number }
  }
}

interface Trip {
  id: string
  name: string
  referenceNumber: string
  destination: string
  _count: { feedbacks: number; students: number }
  isActive: boolean
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [aRes, tRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/trips'),
      ])
      if (aRes.ok) setAnalytics(await aRes.json())
      if (tRes.ok) setTrips(await tRes.json())
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const s = analytics?.summary

  const statCards = [
    { label: 'Total Trips', value: s?.totalTrips ?? 0, icon: MapPin, color: 'blue', bg: 'bg-blue-50', iconBg: 'bg-blue-600' },
    { label: 'Total Students', value: s?.totalStudents ?? 0, icon: Users, color: 'indigo', bg: 'bg-indigo-50', iconBg: 'bg-indigo-600' },
    { label: 'Total Feedback', value: s?.totalFeedbacks ?? 0, icon: MessageSquare, color: 'violet', bg: 'bg-violet-50', iconBg: 'bg-violet-600' },
    { label: 'Response Rate', value: `${s?.responseRate ?? 0}%`, icon: Activity, color: 'emerald', bg: 'bg-emerald-50', iconBg: 'bg-emerald-600' },
    { label: 'Overall Rating', value: s?.avgOverallRating ? `${s.avgOverallRating} ⭐` : 'N/A', icon: Star, color: 'amber', bg: 'bg-amber-50', iconBg: 'bg-amber-500' },
    { label: 'IV Rating', value: s?.avgIvRating ? `${s.avgIvRating} ⭐` : 'N/A', icon: TrendingUp, color: 'orange', bg: 'bg-orange-50', iconBg: 'bg-orange-500' },
    { label: 'NPS Score', value: s?.nps.nps ?? 0, icon: BarChart2, color: 'cyan', bg: 'bg-cyan-50', iconBg: 'bg-cyan-600' },
    { label: 'Promoters', value: `${s?.nps.promoterPct ?? 0}%`, icon: TrendingUp, color: 'green', bg: 'bg-green-50', iconBg: 'bg-green-600' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all PV Holidays industrial visit feedback</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, bg, iconBg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-gray-100`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`${iconBg} p-2 rounded-xl`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NPS breakdown */}
      {s && s.totalFeedbacks > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">NPS Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{s.nps.promoterPct}%</div>
              <div className="text-sm text-gray-500 mt-1">Promoters (9–10)</div>
              <div className="mt-2 h-2 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.nps.promoterPct}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{s.nps.passivePct}%</div>
              <div className="text-sm text-gray-500 mt-1">Passives (7–8)</div>
              <div className="mt-2 h-2 bg-yellow-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${s.nps.passivePct}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{s.nps.detractorPct}%</div>
              <div className="text-sm text-gray-500 mt-1">Detractors (0–6)</div>
              <div className="mt-2 h-2 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.nps.detractorPct}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-lg font-bold text-blue-700">NPS Score: {s.nps.nps}</span>
            <span className="text-sm text-gray-500 ml-2">(Promoters% - Detractors%)</span>
          </div>
        </div>
      )}

      {/* Recent trips */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Trips</h2>
          <Link href="/admin/trips" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {trips.slice(0, 5).map((trip) => (
            <div key={trip.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{trip.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{trip.destination} · {trip.referenceNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{trip._count.feedbacks}</p>
                  <p className="text-xs text-gray-400">responses</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  trip.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {trip.isActive ? 'Active' : 'Closed'}
                </span>
                <div className="flex gap-1">
                  <Link
                    href={`/admin/trips/${trip.id}`}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View trip"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                  {trip._count.feedbacks > 0 && (
                    <a
                      href={`/api/reports/trips/${trip.id}/pdf`}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {trips.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No trips yet. <Link href="/admin/trips/new" className="text-blue-600 hover:underline">Create one</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
