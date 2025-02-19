import { useState } from 'react'
import { DiceInput } from './components/DiceInput'
import { Results } from './components/Results'
import { RollHistory } from './components/RollHistory'
import { parseDiceFormula, type RollResult } from './utils/diceParser'
//import './App.css'

type RollHistoryEntry = RollResult & { id: number }

function App() {
  const [rollResult, setRollResult] = useState<RollResult | null>(null)
  const [rollCount, setRollCount] = useState(0)
  const [rollHistory, setRollHistory] = useState<RollHistoryEntry[]>([])
  const [nextId, setNextId] = useState(0)

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

  const handleClear = () => {
    setRollResult(null)
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

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Fantasy Dice Roller</h1>
          <p className="text-slate-300">Roll any combination of dice with ease</p>
        </header>
        
        <div className="flex justify-center">
          <main className="w-[1000px] flex gap-6">
            <div className="w-[600px] space-y-6 flex-shrink-0">
              <DiceInput onRoll={handleRoll} onClear={handleClear} />
              <Results result={rollResult} rollId={rollCount} />
            </div>
            <div className="w-[350px] flex-shrink-0">
              <RollHistory 
                rolls={rollHistory}
                onReroll={handleReroll}
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
