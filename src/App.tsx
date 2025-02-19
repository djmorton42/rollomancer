import { useState } from 'react'
import { DiceInput } from './components/DiceInput'
import { Results } from './components/Results'
import { RollHistory } from './components/RollHistory'
import { Favourites } from './components/Favourites'
import { parseDiceFormula, type RollResult } from './utils/diceParser'
//import './App.css'

type RollHistoryEntry = RollResult & { id: number }

function App() {
  const [rollResult, setRollResult] = useState<RollResult | null>(null)
  const [rollCount, setRollCount] = useState(0)
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([])
  const [nextId, setNextId] = useState(0)
  const [formula, setFormula] = useState('')
  const [favourites, setFavourites] = useState<Array<RollResult & { id: number, label: string }>>([])

  const handleRoll = (formula: string) => {
    try {
      const result = parseDiceFormula(formula)
      setRollResult(result)
      setRollCount(prev => prev + 1)
      setRollHistory(prev => [{...result, id: nextId}, ...prev])
      setNextId(prev => prev + 1)
    } catch (error) {
      // We'll add proper error handling later
      console.error(error)
    }
  }

  const handleView = (roll: RollResult) => {
    setFormula(roll.formula)
    setRollResult(roll)
    setRollCount(prev => prev + 1) // Trigger animation without adding to history
  }

  const handleClear = () => {
    setRollResult(null)
    setFormula('')
  }

  const handleReroll = (formula: string) => {
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
      const result = parseDiceFormula(formula)
      setRollResult({ ...result, favouriteLabel: label })
      setRollCount(prev => prev + 1)
      setRollHistory(prev => [{...result, id: nextId}, ...prev])
      setNextId(prev => prev + 1)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="p-8">
        <header className="text-center mb-8 text-sm">
          <h1 className="text-4xl font-bold mb-2">RPG Dice Roller</h1>
          <p className="text-slate-300">Enter a dice formula (ie. 5d6 + 1d8 + 3).<br />Prefix with &lt; to take the least of the group (&lt;2d20).<br />
           Prefix with &gt; to take the greatest of the group (&gt;2d20).</p>
        </header>
        
        <div className="flex justify-center">
          <main className="w-[1350px] flex gap-6">
            <div className="w-[350px] flex-shrink-0">
              <Favourites 
                favourites={favourites}
                onRoll={(formula, label) => handleRollFavourite(formula, label)}
                onRemove={handleRemoveFavourite}
                onClearAll={handleClearFavourites}
              />
            </div>
            <div className="w-[600px] space-y-6 flex-shrink-0">
              <DiceInput 
                formula={formula} 
                setFormula={setFormula}
                onRoll={handleRoll} 
                onClear={handleClear} 
              />
              <Results 
                result={rollResult} 
                rollId={rollCount} 
                onAddFavourite={handleAddFavourite}
                favouriteLabel={rollResult?.favouriteLabel}
              />
            </div>
            <div className="w-[350px] flex-shrink-0">
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
