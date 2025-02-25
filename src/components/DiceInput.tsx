import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DiceInputProps {
  formula: string;
  setFormula: (formula: string) => void;
  onRoll: (formula: string) => void;
  onStats: (formula: string) => void;
  onClear: () => void;
}

export function DiceInput({ formula, setFormula, onRoll, onStats, onClear }: DiceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [showHelp, setShowHelp] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formula.trim()) {
      onRoll(formula.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 relative space-y-2 md:space-y-0">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="Enter formula (e.g., 3d20 + 2d4 + 5)"
            className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <div
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors rounded-full bg-slate-600 hover:bg-slate-500 cursor-help"
          >
            ?
          </div>
        </div>
        <div className="flex gap-2 md:w-auto">
          <button
            type="submit"
            className="flex-1 md:flex-none px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Roll
          </button>
          <button
            type="button"
            onClick={() => formula.trim() && onStats(formula.trim())}
            className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 rounded hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            Stats
          </button>
          <button
            type="button"
            onClick={onClear}
            className="flex-1 md:flex-none px-6 py-2 bg-slate-600 rounded hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 w-full max-w-[35rem] p-4 bg-slate-700 rounded-lg shadow-lg border border-slate-600 z-10"
          >
            <h3 className="font-bold mb-2">Example Dice Formulas</h3>
            <div className="space-y-1 text-sm text-slate-300">
              <p><code className="text-emerald-400">3d6</code> → roll three 6-sided dice</p>
              <p><code className="text-emerald-400">2d8 + 1</code> → roll two 8-sided dice and add 1</p>
              <p><code className="text-emerald-400">1d10 + 1d4</code> → roll a 10-sided dice and a 4-sided dice and add the results</p>
              <p><code className="text-emerald-400">&gt;2d20</code> → roll two 20-sided dice and take the highest roll</p>
              <p><code className="text-emerald-400">&lt;3d10</code> → roll three 10-sided dice and take the lowest roll</p>
              <p><code className="text-emerald-400">3&gt;4d6</code> → roll four 6-sided dice and take the highest three rolls</p>
              <p><code className="text-emerald-400">3&lt;4d6</code> → roll four 6-sided dice and take the lowest three rolls</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
} 