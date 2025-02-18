import { useState } from 'react'
import { DiceInput } from './components/DiceInput'
import { Results } from './components/Results'
import { parseDiceFormula, type RollResult } from './utils/diceParser'
//import './App.css'

function App() {
  const [rollResult, setRollResult] = useState<RollResult | null>(null)

  const handleRoll = (formula: string) => {
    try {
      const result = parseDiceFormula(formula)
      setRollResult(result)
    } catch (error) {
      // We'll add proper error handling later
      console.error(error)
    }
  }

  const handleClear = () => {
    setRollResult(null)
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Fantasy Dice Roller</h1>
        <p className="text-slate-300">Roll any combination of dice with ease</p>
      </header>
      
      <main className="max-w-2xl mx-auto">
        <DiceInput onRoll={handleRoll} onClear={handleClear} />
        <Results result={rollResult} />
      </main>
    </div>
  )
}

export default App
