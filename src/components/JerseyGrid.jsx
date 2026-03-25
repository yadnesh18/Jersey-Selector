// src/components/JerseyGrid.jsx
// ─────────────────────────────────────────────────────────────
// Custom jersey number input — student types any number.
// Leading zeros are preserved (e.g. "07" stays "07").
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'

export default function JerseyGrid({ takenNumbers, myNumber, onSelect, disabled }) {
  const [customInput, setCustomInput] = useState('')
  const [customError, setCustomError] = useState('')

  // ── Handle submission ─────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    setCustomError('')

    // Use the raw string so "07" is stored as "07", not 7
    const raw = customInput.trim()

    if (!raw || isNaN(Number(raw))) {
      setCustomError('Please enter a valid number.')
      return
    }
    if (takenNumbers.has(raw)) {
      setCustomError(`#${raw} is already taken. Try another.`)
      return
    }
    if (disabled) return

    onSelect(raw)   // passes "07" as-is to parent
    setCustomInput('')
  }

  const handleChange = (e) => {
    setCustomError('')
    const val = e.target.value
    // Allow up to 3 digits, including leading zeros like "07" or "007"
    if (val === '' || /^\d{1,3}$/.test(val)) setCustomInput(val)
  }

  // Preview state for the live status pill
  const raw     = customInput.trim()
  const isValid = raw.length > 0 && !isNaN(Number(raw))
  const isTaken = isValid && takenNumbers.has(raw)
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
            type="text"
            inputMode="numeric"
            value={customInput}
            onChange={handleChange}
            placeholder="Enter your jersey number"
            disabled={disabled || isMine}
            autoFocus
            className="flex-1 px-5 py-4 rounded-xl bg-[#1a1a26] border border-[#2a2a3d]
                       text-white placeholder-slate-600 text-2xl font-display font-bold text-center
                       focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30
                       disabled:opacity-40 disabled:cursor-not-allowed transition"
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
        {raw && isValid && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                           animate-fade-in border
                           ${isTaken
                             ? 'bg-red-950 border-red-800 text-red-400'
                             : 'bg-green-950 border-green-800 text-green-400'
                           }`}>
            <span>{isTaken ? '✕' : '✓'}</span>
            {isTaken ? `#${raw} is already taken` : `#${raw} is available!`}
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
            {[...takenNumbers].sort().map((n) => (
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