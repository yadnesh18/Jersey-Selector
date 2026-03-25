// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component — owns all state and Supabase interactions.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import JerseyGrid      from './components/JerseyGrid'
import StudentForm     from './components/StudentForm'
import SelectionsList  from './components/SelectionsList'
import Toast           from './components/Toast'

export default function App() {
  // ── Core state ─────────────────────────────────────────────
  const [selections,     setSelections]     = useState([])        // All DB rows
  const [takenNumbers,   setTakenNumbers]   = useState(new Set()) // Set of taken jersey #s
  const [selectedNumber, setSelectedNumber] = useState(null)      // Number user just clicked
  const [myNumber,       setMyNumber]       = useState(null)      // Number this user confirmed
  const [name,           setName]           = useState('')
  const [rollNumber,     setRollNumber]     = useState('')
  const [loading,        setLoading]        = useState(false)
  const [pageLoading,    setPageLoading]    = useState(true)
  const [toast,          setToast]          = useState(null)      // { message, type }
  const [isAdmin,        setIsAdmin]        = useState(false)
  const [activeTab,      setActiveTab]      = useState('grid')    // mobile: 'grid' | 'list'

  // ── Helper: show a toast message ───────────────────────────
  const notify = (message, type = 'success') => setToast({ message, type })

  // ── Build a Set from an array of records ───────────────────
  const toSet = (rows) => new Set(rows.map((r) => r.jersey_number))

  // ── Fetch all selections from Supabase ─────────────────────
  const fetchSelections = useCallback(async () => {
    const { data, error } = await supabase
      .from('jersey_selections')
      .select('*')
      .order('jersey_number', { ascending: true })

    if (error) {
      console.error(error)
      notify('Could not load jersey data. Check your Supabase config.', 'error')
    } else {
      setSelections(data)
      setTakenNumbers(toSet(data))
    }
    setPageLoading(false)
  }, [])

  // Fetch on mount
  useEffect(() => { fetchSelections() }, [fetchSelections])

  // ── Real-time subscription ──────────────────────────────────
  // Supabase sends a message whenever the table changes (insert/delete).
  // We just re-fetch to keep things simple and reliable.
  useEffect(() => {
    const channel = supabase
      .channel('jersey_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jersey_selections' },
        () => fetchSelections()  // re-fetch on any change
      )
      .subscribe()

    return () => supabase.removeChannel(channel) // cleanup on unmount
  }, [fetchSelections])

  // ── Secret admin toggle: Ctrl + Shift + A ──────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsAdmin((prev) => {
          notify(prev ? 'Admin mode off' : '🔓 Admin mode on')
          return !prev
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Handle number click ─────────────────────────────────────
  const handleNumberClick = (num) => {
    // Prevent picking a second jersey
    if (myNumber) {
      notify(`You already have jersey #${myNumber}! Refresh the page to start over.`, 'error')
      return
    }
    setSelectedNumber(num)   // opens the StudentForm panel
  }

  // ── Confirm selection → save to Supabase ───────────────────
  const handleConfirm = async () => {
    if (!name.trim()) return
    setLoading(true)

    const { data, error } = await supabase
      .from('jersey_selections')
      .insert([{
        name:          name.trim(),
        roll_number:   rollNumber.trim() || null,
        jersey_number: selectedNumber,
      }])
      .select()
      .single()

    setLoading(false)

    if (error) {
      // Error code 23505 = PostgreSQL UNIQUE violation
      if (error.code === '23505') {
        notify(`Jersey #${selectedNumber} was just taken! Please pick another.`, 'error')
        fetchSelections()  // refresh to show the latest taken numbers
      } else {
        notify(`Error: ${error.message}`, 'error')
      }
      setSelectedNumber(null)
    } else {
      // ✅ Success — update state immediately without waiting for re-fetch
      setMyNumber(selectedNumber)
      setSelections((prev) => [...prev, data])
      setTakenNumbers((prev) => new Set([...prev, selectedNumber]))
      setSelectedNumber(null)
      setName('')
      setRollNumber('')
      notify(`🎽 Jersey #${selectedNumber} is yours, ${name.trim()}!`)
    }
  }

  // ── Admin: delete all rows ──────────────────────────────────
  const handleReset = async () => {
    if (!window.confirm('Delete ALL jersey selections? This cannot be undone.')) return
    setLoading(true)

    const { error } = await supabase
      .from('jersey_selections')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000') // matches all rows

    setLoading(false)

    if (error) {
      notify('Reset failed: ' + error.message, 'error')
    } else {
      setSelections([])
      setTakenNumbers(new Set())
      setMyNumber(null)
      notify('All selections have been cleared.')
    }
  }

  // ── Derived values ──────────────────────────────────────────
  const takenCount     = takenNumbers.size
  const availableCount = 100 - takenCount

  // ── Render ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen p-4 md:p-8">

      {/* ── Header ── */}
      <header className="max-w-6xl mx-auto mb-8 animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-4">

          {/* Title */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-green-500 mb-1">
              Team Registration
            </p>
            <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-none">
              PICK YOUR<br />
              <span className="text-green-400">JERSEY</span>
            </h1>
          </div>

          {/* Stat cards */}
          <div className="flex gap-3 mt-2 flex-wrap">
            <StatCard label="Available" value={availableCount} color="text-green-400" />
            <StatCard label="Taken"     value={takenCount}     color="text-slate-400" />
            <StatCard label="Total"     value={100}            color="text-slate-600" />
          </div>
        </div>

        {/* "Your jersey" banner */}
        {myNumber && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm animate-pop">
            ⭐ Your jersey: <strong>#{myNumber}</strong> — locked in!
          </div>
        )}
      </header>

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Left — Grid (+ mobile tab toggle) */}
        <div>
          {/* Mobile tab switcher */}
          <div className="flex lg:hidden gap-2 mb-4">
            {['grid', 'list'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-widest transition border
                  ${activeTab === tab
                    ? 'bg-[#12121a] border-green-700 text-green-400'
                    : 'border-[#2a2a3d] text-slate-600 hover:text-slate-400'}`}
              >
                {tab === 'grid' ? '🔢 Grid' : '📋 List'}
              </button>
            ))}
          </div>

          {/* Grid panel */}
          <section className={activeTab !== 'grid' ? 'hidden lg:block' : ''}>
            <div className="bg-[#12121a] rounded-2xl border border-[#1e1e2e] p-4 md:p-6">

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-5 text-[11px] uppercase tracking-widest text-slate-600">
                <LegendDot color="bg-green-800 border-green-600" label="Available" />
                <LegendDot color="bg-[#1a1a26] border-[#2a2a3d]" label="Taken" />
                <LegendDot color="bg-yellow-400"                  label="Yours" />
              </div>

              {/* Loading skeleton OR actual grid */}
              {pageLoading ? (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-[#1a1a26] animate-pulse" />
                  ))}
                </div>
              ) : (
                <JerseyGrid
                  takenNumbers={takenNumbers}
                  myNumber={myNumber}
                  onSelect={handleNumberClick}
                  disabled={loading}
                />
              )}
            </div>
          </section>

          {/* Mobile list panel */}
          <section className={`lg:hidden mt-4 ${activeTab !== 'list' ? 'hidden' : ''}`}>
            <div className="bg-[#12121a] rounded-2xl border border-[#1e1e2e] p-4">
              <h2 className="font-display font-bold text-xl text-white mb-4">
                All Selections
              </h2>
              <SelectionsList
                selections={selections}
                isAdmin={isAdmin}
                onReset={handleReset}
              />
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">

          {/* Form panel — shows when a number is selected */}
          {selectedNumber && !myNumber ? (
            <div className="bg-[#12121a] rounded-2xl border border-green-800/60 p-5 animate-slide-up">
              <h2 className="font-display font-bold text-xl text-white mb-5">Claim Your Jersey</h2>
              <StudentForm
                selectedNumber={selectedNumber}
                name={name}
                setName={setName}
                rollNumber={rollNumber}
                setRollNumber={setRollNumber}
                onConfirm={handleConfirm}
                onCancel={() => setSelectedNumber(null)}
                loading={loading}
              />
            </div>

          ) : !myNumber ? (
            /* Instruction card */
            <div className="bg-[#12121a] rounded-2xl border border-[#1e1e2e] p-5 animate-fade-in">
              <div className="text-4xl mb-3">👆</div>
              <h2 className="font-display font-bold text-xl text-white mb-2">How to pick</h2>
              <ol className="text-sm text-slate-400 space-y-1.5 list-decimal list-inside">
                <li>Click a <span className="text-green-400">green</span> number in the grid</li>
                <li>Enter your name (and optional roll number)</li>
                <li>Click <strong className="text-white">Confirm Pick</strong></li>
              </ol>
              <p className="text-xs text-slate-600 mt-4">
                Grey numbers are taken. You can only claim one jersey per session.
              </p>
            </div>
          ) : null}

          {/* Desktop selections list */}
          <div className="hidden lg:block bg-[#12121a] rounded-2xl border border-[#1e1e2e] p-5">
            <h2 className="font-display font-bold text-xl text-white mb-4">
              Selections
              <span className="ml-2 text-sm font-normal text-slate-500">({takenCount}/100)</span>
            </h2>
            <SelectionsList
              selections={selections}
              isAdmin={isAdmin}
              onReset={handleReset}
            />
          </div>

          <p className="text-[11px] text-slate-700 text-center">
            Ctrl+Shift+A → toggle admin mode
          </p>
        </aside>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  )
}

// ── Tiny helper components ──────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className="text-center px-4 py-3 rounded-xl bg-[#12121a] border border-[#1e1e2e] min-w-[68px]">
      <div className={`font-display font-black text-3xl leading-none ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-slate-600 mt-1">{label}</div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded border ${color}`} />
      {label}
    </span>
  )
}
