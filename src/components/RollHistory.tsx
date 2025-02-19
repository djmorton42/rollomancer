import { motion, AnimatePresence, Variant, AnimationProps } from 'framer-motion'
import type { RollResult } from '../utils/diceParser'
import { useState } from 'react'

interface RollHistoryProps {
  rolls: Array<RollResult & { id: number }>
  onReroll: (formula: string) => void
  onView: (roll: RollResult) => void
  onClearEntry: (id: number) => void
  onClearAll: () => void
}

export function RollHistory({ rolls, onReroll, onView, onClearEntry, onClearAll }: RollHistoryProps) {
  const [popupVisible, setPopupVisible] = useState(false)
  const [popupContent, setPopupContent] = useState<string | null>(null)
  const [popupTimeout, setPopupTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = (roll: RollResult) => {
    const timeout = setTimeout(() => {
      const breakdown = getRollBreakdown(roll)
      setPopupContent(breakdown)
      setPopupVisible(true)
    }, 1000)
    setPopupTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (popupTimeout) {
      clearTimeout(popupTimeout)
    }
    setPopupVisible(false)
    setPopupContent(null)
  }

  const getRollBreakdown = (roll: RollResult): string => {
    const parts = roll.groups.map(group => {
      const diceStr = `${group.count}d${group.sides}`
      const values = group.dice.map(die => die.value).join(', ')
      return `${diceStr}[${values}]=${group.value}`
    })

    const modifier = roll.total - roll.groups.reduce((sum, g) => sum + g.value, 0)
    if (modifier !== 0) {
      parts.push(modifier > 0 ? `+${modifier}` : modifier.toString())
    }

    return parts.join(' ')
  }

  return (
    <div className="bg-slate-700 rounded-lg p-4 min-h-[400px] relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Roll History</h2>
        <button
          onClick={onClearAll}
          className="px-4 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {rolls.map((roll) => (
            <motion.div
              key={roll.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="p-2 bg-slate-800 rounded group relative"
              onMouseEnter={() => handleMouseEnter(roll)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">{roll.formula}</span>
                <span className="font-medium">{roll.total}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-end px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80">
                <div className="flex gap-1">
                  <button
                    onClick={() => onReroll(roll.formula)}
                    className="px-2 py-0.5 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Reroll
                  </button>
                  <button
                    onClick={() => onView(roll)}
                    className="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onClearEntry(roll.id)}
                    className="px-2 py-0.5 text-xs bg-slate-600 hover:bg-slate-700 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {popupVisible && popupContent && (
        <div className="absolute top-0 left-0 mt-2 p-2 bg-white text-black rounded shadow-lg">
          {popupContent}
        </div>
      )}
    </div>
  )
} 