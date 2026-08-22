'use client'

import { useEffect, useState, use, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, QrCode, Copy, Check, Loader2,
  MapPin, Calendar, Building2, Users, MessageSquare, Star, ExternalLink
} from 'lucide-react'
import { formatDate, avg } from '@/lib/utils'

interface TripDetail {
  id: string
  name: string
  referenceNumber: string
  collegeName: string
  destination: string
  description: string
  startDate: string
  endDate: string
  feedbackCode: string
  isActive: boolean
  students: any[]
  feedbacks: any[]
  _count: { students: number; feedbacks: number }
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}>
      <TripDetailContent params={params} />
    </Suspense>
  )
}

function TripDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/trips/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTrip(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function generateQR() {
    if (!trip) return
    setQrLoading(true)
    try {
      const QRCode = await import('qrcode')
      const url = `${window.location.origin}/feedback/${trip.feedbackCode}`
      const dataUrl = await QRCode.default.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: '#0f2b54', light: '#ffffff' },
      })
      setQrDataUrl(dataUrl)
    } catch (e) {
      console.error('QR error:', e)
    } finally {
      setQrLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'qr' && trip && !qrDataUrl) {
      generateQR()
    }
  }, [activeTab, trip])

  async function copyLink() {
    if (!trip) return
    const url = `${window.location.origin}/feedback/${trip.feedbackCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadQR() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `QR_${trip?.feedbackCode}_${trip?.referenceNumber}.png`
    a.click()
  }

  async function downloadPDF() {
    if (!trip) return
    setPdfLoading(true)
    try {
      const res = await fetch(`/api/reports/trips/${trip.id}/pdf`)
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'PDF generation failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PV_Holidays_Feedback_Report_${trip.referenceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center h-64 items-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )

  if (!trip) return <div className="text-center py-20 text-gray-500">Trip not found</div>

  const feedbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/feedback/${trip.feedbackCode}` : ''
  const avgOverall = avg(trip.feedbacks.map((f: any) => f.overallRating))
  const avgIV = avg(trip.feedbacks.map((f: any) => f.ivRating))


  const tabs = ['overview', 'qr', 'feedback']

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/trips" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
          <p className="text-gray-500 text-sm">{trip.referenceNumber}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            disabled={pdfLoading || trip._count.feedbacks === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {pdfLoading ? 'Generating...' : 'PDF Report'}
          </button>
          <a
            href={`/api/admin/export?tripId=${trip.id}`}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> CSV
          </a>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'qr' ? 'QR Code' : tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Trip info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: MapPin, label: 'Destination', value: trip.destination },
                { icon: Building2, label: 'College', value: trip.collegeName },
                { icon: Calendar, label: 'Start Date', value: formatDate(trip.startDate) },
                { icon: Calendar, label: 'End Date', value: formatDate(trip.endDate) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {trip.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                <p className="text-sm text-gray-700">{trip.description}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: trip._count.students, icon: Users, color: 'blue' },
              { label: 'Responses', value: trip._count.feedbacks, icon: MessageSquare, color: 'violet' },
              { label: 'Overall Rating', value: avgOverall ? `${avgOverall}★` : 'N/A', icon: Star, color: 'amber' },
              { label: 'IV Rating', value: avgIV ? `${avgIV}★` : 'N/A', icon: Star, color: 'orange' },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Feedback URL */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Feedback URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800 break-all">
                {feedbackUrl}
              </code>
              <button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <a href={feedbackUrl} target="_blank" className="bg-white border border-blue-200 hover:bg-blue-50 p-2 rounded-lg transition-colors flex-shrink-0">
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* QR Code */}
      {activeTab === 'qr' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">QR Code</h2>
          <p className="text-gray-500 text-sm mb-6">Students scan this QR code to access the feedback form</p>
          
          {qrLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          {!qrLoading && qrDataUrl && (
            <>
              <div className="inline-block bg-white border-4 border-blue-900 rounded-3xl p-4 shadow-xl mb-6">
                <img src={qrDataUrl} alt="Feedback QR Code" className="w-64 h-64" />
              </div>
              <div className="text-sm text-gray-500 mb-6">
                <p className="font-semibold text-gray-800">{trip.name}</p>
                <p>Feedback Code: <span className="font-mono font-bold text-blue-700">{trip.feedbackCode}</span></p>
                <p className="mt-1 text-xs break-all">{feedbackUrl}</p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={downloadQR}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" /> Download QR
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </>
          )}
          
          {!qrLoading && !qrDataUrl && (
            <button onClick={generateQR} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
              <QrCode className="w-5 h-5" /> Generate QR Code
            </button>
          )}
        </div>
      )}

      {/* Feedback tab */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{trip._count.feedbacks} Responses</h2>
            <a href={`/admin/feedback?tripId=${trip.id}`} className="text-blue-600 hover:text-blue-700 text-sm">
              View in detail →
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {trip.feedbacks.slice(0, 10).map((f: any) => (
              <div key={f.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{f.student.name}</p>
                  <p className="text-gray-400 text-xs">{f.student.rollNumber} · {f.student.department}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-amber-600 font-bold">{f.overallRating}★</span>
                  <span className={`font-semibold text-xs ${f.npsScore >= 9 ? 'text-green-600' : f.npsScore >= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                    NPS: {f.npsScore}
                  </span>
                  <span className="text-gray-400 text-xs">{new Date(f.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
          {trip._count.feedbacks > 10 && (
            <div className="p-4 text-center border-t border-gray-100">
              <a href={`/admin/feedback?tripId=${trip.id}`} className="text-blue-600 text-sm hover:underline">
                View all {trip._count.feedbacks} responses →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
