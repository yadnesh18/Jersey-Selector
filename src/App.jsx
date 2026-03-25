// src/App.jsx

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import JerseyGrid  from './components/JerseyGrid'
import StudentForm from './components/StudentForm'
import Toast       from './components/Toast'

export default function App() {
  const [takenNumbers,   setTakenNumbers]   = useState(new Set())
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [myNumber,       setMyNumber]       = useState(null)
  const [name,           setName]           = useState('')
  const [rollNumber,     setRollNumber]     = useState('')
  const [loading,        setLoading]        = useState(false)
  const [pageLoading,    setPageLoading]    = useState(true)
  const [toast,          setToast]          = useState(null)

  const notify = (message, type = 'success') => setToast({ message, type })
  const toSet  = (rows) => new Set(rows.map((r) => r.jersey_number))

  // Fetch taken numbers on mount
  const fetchSelections = useCallback(async () => {
    const { data, error } = await supabase
      .from('jersey_selections')
      .select('jersey_number')

    if (error) {
      notify('Could not load jersey data. Check your Supabase config.', 'error')
    } else {
      setTakenNumbers(toSet(data))
    }
    setPageLoading(false)
  }, [])

  useEffect(() => { fetchSelections() }, [fetchSelections])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('jersey_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jersey_selections' },
        () => fetchSelections()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchSelections])

  // Handle number pick
  const handleNumberClick = (num) => {
    if (myNumber) {
      notify(`You already have jersey #${myNumber}! Refresh to start over.`, 'error')
      return
    }
    setSelectedNumber(num)
  }

  // Confirm → save to Supabase
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
      if (error.code === '23505') {
        notify(`Jersey #${selectedNumber} was just taken! Please pick another.`, 'error')
        fetchSelections()
      } else {
        notify(`Error: ${error.message}`, 'error')
      }
      setSelectedNumber(null)
    } else {
      setMyNumber(selectedNumber)
      setTakenNumbers((prev) => new Set([...prev, selectedNumber]))
      setSelectedNumber(null)
      setName('')
      setRollNumber('')
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">

      {/* Header */}
      <header className="max-w-xl mx-auto mb-8 animate-fade-in">
        <p className="text-[11px] uppercase tracking-[0.35em] text-green-500 mb-1">
          Team Registration
        </p>
        <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-none">
          PICK YOUR<br />
          <span className="text-green-400">JERSEY</span>
        </h1>

        {myNumber && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm animate-pop">
            Your jersey: <strong>#{myNumber}</strong> — locked in!
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="max-w-xl mx-auto space-y-4">

        {/* Jersey input */}
        <div className="bg-[#12121a] rounded-2xl border border-[#1e1e2e] p-5 md:p-6">
          {pageLoading ? (
            <div className="h-16 rounded-xl bg-[#1a1a26] animate-pulse" />
          ) : (
            <JerseyGrid
              takenNumbers={takenNumbers}
              myNumber={myNumber}
              onSelect={handleNumberClick}
              disabled={loading}
            />
          )}
        </div>

        {/* Student form — appears after picking a number */}
        {selectedNumber && !myNumber && (
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
        )}

      </div>

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