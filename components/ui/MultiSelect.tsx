'use client'

import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700'
            )}
          >
            {isSelected && '✓ '}
            {opt}
          </button>
        )
      })}
    </div>
  )
}
