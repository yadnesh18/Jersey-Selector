// src/components/StudentForm.jsx

import { useState } from 'react'

export default function StudentForm({
  selectedNumber,
  name,
  setName,
  rollNumber,
  setRollNumber,
  contactNumber,
  setContactNumber,
  onConfirm,
  onCancel,
  loading,
}) {
  const [contactError, setContactError] = useState('')

  // Indian mobile number rules:
  // - 10 digits
  // - Must start with 6, 7, 8, or 9
  const validateContact = (val) => {
    if (!val.trim()) return '' // optional field, blank is fine
    if (!/^[6-9]\d{9}$/.test(val.trim())) {
      return 'Enter a valid 10-digit Indian mobile number (starting with 6–9).'
    }
    return ''
  }

  const handleContactChange = (e) => {
    const val = e.target.value
    // Only allow digits, max 10
    if (val === '' || /^\d{0,10}$/.test(val)) {
      setContactNumber(val)
      setContactError(validateContact(val))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validateContact(contactNumber)
    if (err) { setContactError(err); return }
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
        {/* Name */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
            Student Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter the name to be printed on the jersey"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a26] border border-[#2a2a3d]
                       text-white placeholder-slate-600 text-sm
                       focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50
                       transition"
          />
        </div>

        {/* Roll Number */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
            Roll Number
            <span className="ml-1 text-slate-700 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a26] border border-[#2a2a3d]
                       text-white placeholder-slate-600 text-sm
                       focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50
                       transition"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">
            Contact Number
            <span className="ml-1 text-slate-700 normal-case tracking-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            {/* +91 prefix badge */}
            <div className="flex items-center px-3 rounded-lg bg-[#1a1a26] border border-[#2a2a3d]
                            text-slate-400 text-sm font-mono shrink-0 select-none">
              +91
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={contactNumber}
              onChange={handleContactChange}
              placeholder="9876543210"
              maxLength={10}
              className={`flex-1 px-4 py-3 rounded-lg bg-[#1a1a26] border text-white
                         placeholder-slate-600 text-sm transition
                         focus:outline-none focus:ring-1
                         ${contactError
                           ? 'border-red-600 focus:border-red-500 focus:ring-red-500/50'
                           : 'border-[#2a2a3d] focus:border-green-500 focus:ring-green-500/50'
                         }`}
            />
          </div>

          {/* Live validation feedback */}
          {contactNumber && !contactError && contactNumber.length === 10 && (
            <p className="mt-1.5 text-xs text-green-500 animate-fade-in">✓ Valid Indian mobile number</p>
          )}
          {contactError && (
            <p className="mt-1.5 text-xs text-red-400 animate-fade-in">{contactError}</p>
          )}
          <p className="mt-1 text-[11px] text-slate-700">
            10-digit number starting with 6, 7, 8, or 9
          </p>
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
            disabled={!name.trim() || loading || !!contactError}
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