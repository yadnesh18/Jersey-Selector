// src/components/StudentForm.jsx
// ─────────────────────────────────────────────────────────────
// Shown after the student clicks a jersey number.
// Collects name + optional roll number, then calls onConfirm.
// ─────────────────────────────────────────────────────────────

export default function StudentForm({
  selectedNumber,
  name,
  setName,
  rollNumber,
  setRollNumber,
  onConfirm,
  onCancel,
  loading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) onConfirm()
  }

  return (
    <div className="animate-slide-up">
      {/* Jersey preview */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center
                     bg-green-900/30 border-2 border-green-600 shrink-0"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '2.4rem', color: '#22c55e' }}
        >
          {selectedNumber}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-0.5">You chose</p>
          <p className="text-2xl text-white font-display font-black">Jersey #{selectedNumber}</p>
          <p className="text-xs text-slate-500 mt-0.5">Fill in your details to confirm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
            Student Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a26] border border-[#2a2a3d]
                       text-white placeholder-slate-600 text-sm
                       focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50
                       transition"
          />
        </div>

        {/* Roll number field (optional) */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
            Roll Number
            <span className="ml-1 text-slate-700 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g. 2024CS042"
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a26] border border-[#2a2a3d]
                       text-white placeholder-slate-600 text-sm
                       focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50
                       transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-[#2a2a3d] text-slate-400
                       hover:border-slate-500 hover:text-white transition text-sm uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white
                       font-semibold text-sm uppercase tracking-widest transition
                       disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? 'Saving…' : 'Confirm Pick'}
          </button>
        </div>
      </form>
    </div>
  )
}
