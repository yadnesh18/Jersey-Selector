// src/components/SelectionsList.jsx
// ─────────────────────────────────────────────────────────────
// Displays a sorted table of all jersey selections.
// Admins see a "Reset All" button (toggle admin mode with Ctrl+Shift+A).
// ─────────────────────────────────────────────────────────────

export default function SelectionsList({ selections, isAdmin, onReset }) {
  if (selections.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3 opacity-30">👕</div>
        <p className="text-xs uppercase tracking-widest text-slate-600">No jerseys claimed yet</p>
      </div>
    )
  }

  const sorted = [...selections].sort((a, b) => a.jersey_number - b.jersey_number)

  return (
    <div>
      {/* Column headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-[10px] uppercase tracking-widest text-slate-600 mb-1">
        <span>#</span>
        <span>Name</span>
        <span>Roll No.</span>
      </div>

      {/* Rows — scrollable */}
      <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
        {sorted.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-3 gap-2 px-3 py-2.5 rounded-lg
                       bg-[#0e0e18] border border-[#1e1e2e] hover:border-[#2a2a3d]
                       transition text-sm items-center animate-fade-in"
          >
            {/* Jersey number */}
            <span className="text-green-400 font-display font-black text-base">
              {row.jersey_number}
            </span>
            {/* Name */}
            <span className="text-slate-200 truncate">{row.name}</span>
            {/* Roll number */}
            <span className="text-slate-600 truncate text-xs">{row.roll_number || '—'}</span>
          </div>
        ))}
      </div>

      {/* Admin: reset button */}
      {isAdmin && (
        <button
          onClick={onReset}
          className="mt-4 w-full py-2.5 rounded-lg border border-red-900 text-red-500
                     hover:bg-red-950 hover:border-red-700 text-xs uppercase tracking-widest transition"
        >
          ⚠ Reset All Selections
        </button>
      )}
    </div>
  )
}
