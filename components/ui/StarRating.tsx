'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (val: number) => void
  label?: string
}

const LABELS = ['', 'Poor', 'Fair', 'Average', 'Good', 'Excellent']

export function StarRating({ value, onChange, label }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      )}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-btn focus:outline-none"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              aria-label={`Rate ${star} out of 5`}
            >
              <svg
                className={`w-10 h-10 transition-colors ${
                  (hovered || value) >= star
                    ? 'text-amber-400'
                    : 'text-gray-200'
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        {(hovered || value) > 0 && (
          <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            {LABELS[hovered || value]}
          </span>
        )}
      </div>
    </div>
  )
}
