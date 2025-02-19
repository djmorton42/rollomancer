import { useState, useRef } from 'react'

interface DiceInputProps {
  formula: string;
  setFormula: (formula: string) => void;
  onRoll: (formula: string) => void;
  onClear: () => void;
}

export function DiceInput({ formula, setFormula, onRoll, onClear }: DiceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formula.trim()) {
      onRoll(formula.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="Enter dice formula (e.g., 3d20 + 2d4 + 5)"
          className="flex-1 px-4 py-2 rounded bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Roll
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-6 py-2 bg-slate-600 rounded hover:bg-slate-700 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  )
} 