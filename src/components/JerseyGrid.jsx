// src/components/JerseyGrid.jsx
// ─────────────────────────────────────────────────────────────
// Custom jersey number input — student types any number 1–100.
// No grid; just a clean input + Pick button.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'

export default function JerseyGrid({ takenNumbers, myNumber, onSelect, disabled }) {
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState('')

  // ── Handle submission ─────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    setCustomError('')

    const num = parseInt(customInput, 10)

    if (!customInput.trim() || isNaN(num)) {
      setCustomError('Please enter a valid number.')
      return
    }
    if (takenNumbers.has(num)) {
      setCustomError(`#${num} is already taken. Try another.`)
      return
    }
    if (disabled) return

    onSelect(num)
    setCustomInput('')
  }

  const handleChange = (e) => {
    setCustomError('')
    const val = e.target.value
    if (val === '' || /^\d{1,3}$/.test(val)) setCustomInput(val)
  }

  // Preview state of the typed number
  const preview = parseInt(customInput, 10)
  const isValid = !isNaN(preview) && preview >= 1 && preview <= 100
  const isTaken = isValid && takenNumbers.has(preview)
  const isMine  = myNumber !== null

  return (
    <div className="w-full">

      {/* ── Already picked banner ── */}
      {isMine && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl
                        bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 animate-pop">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm font-semibold">Your jersey is #{myNumber}</p>
            <p className="text-xs text-yellow-600">Refresh the page to start over.</p>
          </div>
        </div>
      )}

      {/* ── Input form ── */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1">
          Enter Jersey Number
        </label>

        {/* Large number input + Pick button */}
        <div className="flex gap-3">
          <input
            type="number"
            min={1}
            max={1000}
            value={customInput}
            onChange={handleChange}
            placeholder="1 – 100"
            disabled={disabled || isMine}
            autoFocus
            className="flex-1 px-5 py-4 rounded-xl bg-[#1a1a26] border border-[#2a2a3d]
                       text-white placeholder-slate-600 text-2xl font-display font-bold text-center
                       focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30
                       disabled:opacity-40 disabled:cursor-not-allowed transition
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="submit"
            disabled={!customInput || disabled || isMine}
            className="px-6 py-4 rounded-xl bg-green-700 hover:bg-green-600 text-white
                       font-display font-bold text-lg uppercase tracking-widest transition
                       disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
          >
            Pick
          </button>
        </div>

        {/* Live status pill */}
        {customInput && isValid && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                           animate-fade-in border
                           ${isTaken
                             ? 'bg-red-950 border-red-800 text-red-400'
                             : 'bg-green-950 border-green-800 text-green-400'
                           }`}>
            <span>{isTaken ? '✕' : '✓'}</span>
            {isTaken ? `#${preview} is already taken` : `#${preview} is available!`}
          </div>
        )}

        {/* Validation error */}
        {customError && (
          <p className="text-xs text-red-400 animate-fade-in">{customError}</p>
        )}
      </form>

      {/* ── Taken numbers summary ── */}
      {takenNumbers.size > 0 && (
        <div className="mt-6 pt-5 border-t border-[#1e1e2e]">
          <p className="text-[11px] uppercase tracking-widest text-slate-600 mb-2">
            Taken numbers ({takenNumbers.size})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...takenNumbers].sort((a, b) => a - b).map((n) => (
              <span
                key={n}
                className="px-2 py-0.5 rounded bg-[#1a1a26] border border-[#2a2a3d]
                           text-xs text-slate-500 font-display font-bold"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}