import { useState, useEffect } from 'react'
import { DiceInput } from './components/DiceInput'
import { Results } from './components/Results'
import { RollHistory } from './components/RollHistory'
import { Favourites } from './components/Favourites'
import { HistogramResult, parseDiceFormula, type RollResult, calculateHistogram } from './utils/diceParser'
import { ErrorPopup } from './components/ErrorPopup'
import { loadFromStorage, saveToStorage } from './utils/storage'
import { AnimatePresence } from 'framer-motion'
import { Stats } from './components/Stats'
//import './App.css'

type RollHistoryEntry = RollResult & { id: number }

function App() {
  const [rollResult, setRollResult] = useState<RollResult | null>(null)
  const [rollCount, setRollCount] = useState(0)
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>(() => 
    loadFromStorage('HISTORY', [])
  )
  const [nextId, setNextId] = useState(() => 
    loadFromStorage('NEXT_ID', 0)
  )
  const [formula, setFormula] = useState('')
  const [favourites, setFavourites] = useState<Array<RollResult & { id: number, label: string }>>(() =>
    loadFromStorage('FAVOURITES', [])
  )
  const [showStats, setShowStats] = useState(false)
  const [statsResult, setStatsResult] = useState<HistogramResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingFormula, setPendingFormula] = useState<string>('')
  const [statsFormula, setStatsFormula] = useState<string>('')

  useEffect(() => {
    saveToStorage('HISTORY', rollHistory)
  }, [rollHistory])

  useEffect(() => {
    saveToStorage('FAVOURITES', favourites)
  }, [favourites])

  useEffect(() => {
    saveToStorage('NEXT_ID', nextId)
  }, [nextId])

  const handleRoll = (formula: string) => {
    try {
      const result = parseDiceFormula(formula)
      setRollResult(result)
      setRollCount(prev => prev + 1)
      setRollHistory(prev => [{...result, id: nextId}, ...prev])
      setNextId(prev => prev + 1)
      setStatsResult(null)
      setShowStats(false)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid dice formula')
    }
  }

  const handleView = (roll: RollResult) => {
    setFormula(roll.formula)
    setRollResult(roll)
    setRollCount(prev => prev + 1) // Trigger animation without adding to history
  }

  const handleClear = () => {
    setRollResult(null)
    setStatsResult(null)
    setShowStats(false)
    setFormula('')
  }

  const handleReroll = (formula: string) => {
    setFormula(formula)
    handleRoll(formula)
  }

  const handleClearHistoryEntry = (id: number) => {
    setRollHistory(prev => prev.filter(entry => entry.id !== id))
  }

  const handleClearAll = () => {
    setRollHistory([]); // Clear all history entries
  };

  const handleAddFavourite = (formula: string, label: string) => {
    const result = parseDiceFormula(formula)
    setFavourites(prev => [...prev, { ...result, id: nextId, label }])
    setNextId(prev => prev + 1)
  }

  const handleClearFavourites = () => {
    setFavourites([])
  }

  const handleRemoveFavourite = (id: number) => {
    setFavourites(prev => prev.filter(entry => entry.id !== id))
  }

  const handleRollFavourite = (formula: string, label: string) => {
    try {
      setFormula(formula)
      const result = parseDiceFormula(formula)
      setRollResult({ ...result, favouriteLabel: label })
      setRollCount(prev => prev + 1)
      setRollHistory(prev => [{...result, id: nextId}, ...prev])
      setNextId(prev => prev + 1)
      setStatsResult(null)
      setShowStats(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFormulaChange = (newFormula: string) => {
    setFormula(newFormula)
    setPendingFormula(newFormula)
    setError(null)
  }

  const handleStats = () => {
    try {
      const stats = calculateHistogram(pendingFormula)
      setStatsResult(stats)
      setShowStats(true)
      setRollResult(null)
      setError(null)
      setFormula(pendingFormula)
      setStatsFormula(pendingFormula)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid dice formula')
    }
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      <div className="p-4 sm:p-8">
        <header className="text-center mb-8 text-sm">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Rollomancer</h1>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">RPG Dice Roller</h2>
          <a 
            href="https://github.com/djmorton42/rollomancer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-300 transition-colors text-sm inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>View on GitHub</span>
          </a>
        </header>
        
        <div className="flex justify-center">
          <main className="w-full max-w-[1350px] flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-full lg:w-[600px] order-1 lg:order-2 space-y-4 lg:space-y-6 lg:flex-shrink-0">
              <DiceInput 
                formula={formula} 
                setFormula={handleFormulaChange}
                onRoll={handleRoll} 
                onStats={handleStats}
                onClear={handleClear} 
              />
              <AnimatePresence mode="wait">
                {showStats && statsResult ? (
                  <Stats stats={statsResult} formula={statsFormula} />
                ) : (
                  <Results 
                    result={rollResult} 
                    rollId={rollCount} 
                    onAddFavourite={handleAddFavourite}
                    favouriteLabel={rollResult?.favouriteLabel}
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="w-full lg:w-[350px] order-2 lg:order-1 lg:flex-shrink-0">
              <Favourites 
                favourites={favourites}
                onRoll={(formula, label) => handleRollFavourite(formula, label)}
                onRemove={handleRemoveFavourite}
                onClearAll={handleClearFavourites}
              />
            </div>
            <div className="w-full lg:w-[350px] order-3 lg:order-3 lg:flex-shrink-0">
              <RollHistory 
                rolls={rollHistory}
                onReroll={handleReroll}
                onView={handleView}
                onClearEntry={handleClearHistoryEntry}
                onClearAll={handleClearAll}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
