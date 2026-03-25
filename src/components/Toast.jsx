// src/components/Toast.jsx
// ─────────────────────────────────────────────────────────────
// Fixed bottom-center notification.
// Auto-dismisses after 4 seconds.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const isSuccess = type === 'success'

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                  flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border
                  text-sm font-medium
                  animate-slide-up
                  ${isSuccess
                    ? 'bg-green-950 border-green-700 text-green-300'
                    : 'bg-red-950  border-red-700  text-red-300  animate-shake'
                  }`}
    >
      <span>{isSuccess ? '✅' : '❌'}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-40 hover:opacity-100 transition text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
