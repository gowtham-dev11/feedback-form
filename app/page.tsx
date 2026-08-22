import Link from 'next/link'
import { QrCode, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-2xl mb-6 shadow-blue-500/30">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">
            PV HOLIDAYS
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-blue-200 text-lg font-medium">Industrial Visit Feedback System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Your Experience Matters to Us
          </h2>
          <p className="text-blue-100 text-base leading-relaxed mb-8">
            Scan the QR code provided by your tour coordinator to submit your feedback about the Industrial Visit and College Tour.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3 text-white">
              <QrCode className="w-6 h-6 text-blue-300" />
              <span className="text-sm font-medium">Scan your QR code to begin</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '📱', label: 'Scan QR Code' },
            { icon: '✍️', label: 'Fill Feedback' },
            { icon: '✅', label: 'Submit & Done' },
          ].map((step, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">{step.icon}</div>
              <p className="text-white/70 text-xs font-medium">{step.label}</p>
            </div>
          ))}
        </div>

        {/* Admin link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-all transform hover:scale-105"
        >
          Admin Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-white/40 text-xs">
        © {new Date().getFullYear()} PV Holidays · Chennai, India
      </div>
    </main>
  )
}
