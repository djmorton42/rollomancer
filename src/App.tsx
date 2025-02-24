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

  const handleStats = (formula: string) => {
    try {
      const stats = calculateHistogram(formula)
      setStatsResult(stats)
      setShowStats(true)
      setRollResult(null)
      setError(null)
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
        </header>
        
        <div className="flex justify-center">
          <main className="w-full max-w-[1350px] flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="w-full lg:w-[600px] order-1 lg:order-2 space-y-4 lg:space-y-6 lg:flex-shrink-0">
              <DiceInput 
                formula={formula} 
                setFormula={setFormula}
                onRoll={handleRoll} 
                onStats={handleStats}
                onClear={handleClear} 
              />
              <AnimatePresence mode="wait">
                {showStats && statsResult ? (
                  <Stats stats={statsResult} formula={formula} />
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
