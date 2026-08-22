'use client'

import { cn } from '@/lib/utils'

interface NPSSelectorProps {
  value: number | null
  onChange: (val: number) => void
}

export function NPSSelector({ value, onChange }: NPSSelectorProps) {
  const getColor = (score: number) => {
    if (score <= 6) return 'bg-red-500 text-white border-red-500'
    if (score <= 8) return 'bg-yellow-500 text-white border-yellow-500'
    return 'bg-green-500 text-white border-green-500'
  }

  const getSelectedColor = (score: number) => {
    if (value === null) return ''
    if (score <= 6) return 'border-red-200 text-red-600 hover:bg-red-50'
    if (score <= 8) return 'border-yellow-200 text-yellow-600 hover:bg-yellow-50'
    return 'border-green-200 text-green-600 hover:bg-green-50'
  }

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all',
              value === i
                ? getColor(i)
                : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            )}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>0 – Not likely</span>
        <span>10 – Extremely likely</span>
      </div>
      {value !== null && (
        <p className="mt-2 text-sm font-medium">
          {value <= 6 ? (
            <span className="text-red-600">Detractor (0–6)</span>
          ) : value <= 8 ? (
            <span className="text-yellow-600">Passive (7–8)</span>
          ) : (
            <span className="text-green-600">Promoter (9–10) 🎉</span>
          )}
        </p>
      )}
    </div>
  )
}
