import { motion, AnimatePresence, Variant, AnimationProps } from 'framer-motion'
import type { RollResult } from '../utils/diceParser'

interface RollHistoryProps {
  rolls: Array<RollResult & { id: number }>
  onReroll: (formula: string) => void
  onClearEntry: (id: number) => void
  onClearAll: () => void
}

export function RollHistory({ rolls, onReroll, onClearEntry, onClearAll }: RollHistoryProps) {
  return (
    <div className="bg-slate-700 rounded-lg p-4 min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Roll History</h2>
        <button
          onClick={onClearAll}
          className="px-4 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {rolls.map((roll) => (
            <motion.div
              key={roll.id}
              initial={{ 
                opacity: 0, 
                x: 20, 
                height: 'auto',
                backgroundColor: 'rgb(30 41 59)' // slate-800
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                height: 'auto',
                backgroundColor: 'rgb(30 41 59)', // slate-800
                transition: { duration: 0.3 }
              }}
              exit={[
                {
                  backgroundColor: 'rgb(153 27 27)',
                  transition: { duration: 2.0 }
                },
                {
                  opacity: 0,
                  x: -100,
                  height: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  backgroundColor: 'rgb(153 27 27)', // Keep the red color during slide-out
                  transition: {
                    duration: 1.0,
                    opacity: { duration: 1.0 },
                    x: { duration: 1.0 },
                    height: { duration: 2.0, delay: 0.1 },
                    marginTop: { duration: 2.0, delay: 0.1 },
                    marginBottom: { duration: 2.0, delay: 0.1 }
                  }
                }
              ] as unknown as AnimationProps['exit']}
              className="relative p-3 rounded group overflow-hidden"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">{roll.formula}</span>
                <span className="font-bold">{roll.total}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-end px-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80">
                <div className="flex gap-2">
                  <button
                    onClick={() => onReroll(roll.formula)}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Reroll
                  </button>
                  <button
                    onClick={() => onClearEntry(roll.id)}
                    className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-700 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 