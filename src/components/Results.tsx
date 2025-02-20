import { type RollResult, type DiceGroupResult, type DiceOperator } from '../utils/diceParser'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ResultsProps {
  result: RollResult | null;
  rollId: number;
  onAddFavourite: (formula: string, label: string) => void;
  favouriteLabel?: string;
}

function getDiceStyles(operator: DiceOperator) {
  // Base styles for all dice
  const baseStyle = "inline-block px-3 py-1 rounded-full text-sm font-medium"
  
  switch (operator) {
    case 'sum':
      return `${baseStyle} bg-blue-900 text-blue-100 border-2 border-blue-500`
    case 'greatest':
      return `${baseStyle} bg-emerald-900 text-emerald-100 border-2 border-emerald-500`
    case 'least':
      return `${baseStyle} bg-amber-900 text-amber-100 border-2 border-amber-500`
  }
}

function DiceGroup({ group, rollId }: { group: DiceGroupResult; rollId: number }) {
  const operatorSymbol = {
    sum: '∑',
    greatest: 'max',
    least: 'min'
  }[group.operator]

  const operatorClass = {
    sum: 'text-blue-400',
    greatest: 'text-emerald-400',
    least: 'text-amber-400'
  }[group.operator]

  const diceStyle = getDiceStyles(group.operator)

  return (
    <motion.div
      key={`group-${rollId}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-slate-600 pt-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold">
          {group.count}d{group.sides} 
          <span className={`ml-1 ${operatorClass}`}>
            ({operatorSymbol})
          </span>:
        </span>
        <div className="flex flex-wrap gap-2">
          {group.dice.map((die, diceIndex) => (
            <motion.span
              key={`die-${rollId}-${diceIndex}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.5,
                delay: diceIndex * 0.1,
                type: "spring",
                stiffness: 200
              }}
              className={diceStyle}
            >
              {die.value}
            </motion.span>
          ))}
        </div>
      </div>
      <motion.div 
        key={`total-${rollId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-slate-300"
      >
        Group Total: {group.value}
      </motion.div>
    </motion.div>
  )
}

export function Results({ result, rollId, onAddFavourite, favouriteLabel }: ResultsProps) {
  const [newFavouriteLabel, setNewFavouriteLabel] = useState('')

  if (!result) return null

  const groupsTotal = result.groups.reduce((sum, group) => sum + group.value, 0)
  const groupsAverage = result.groups.reduce((sum, group) => sum + group.average, 0)
  const modifier = result.total - groupsTotal
  const totalAverage = groupsAverage + modifier

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`result-${rollId}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-700 rounded-lg p-4 mb-6"
      >
        <motion.div 
          key={`header-${rollId}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-xl font-bold mb-2">Roll Results</h2>
          {favouriteLabel && (
            <div className="text-emerald-400 text-sm mb-2">
              Favourite: {favouriteLabel}
            </div>
          )}
          <div className="text-slate-300">Formula: {result.formula}</div>
        </motion.div>

        <div className="space-y-4">
          {result.groups.map((group, index) => (
            <DiceGroup 
              key={`group-${rollId}-${index}`} 
              group={group} 
              rollId={rollId}
            />
          ))}
        </div>

        <motion.div 
          key={`footer-${rollId}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 pt-3 border-t border-slate-600"
        >
          {modifier !== 0 && (
            <div className="text-slate-300 mb-2">
              Modifier: {modifier > 0 ? '+' : ''}{modifier}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">
                Total: {result.total}
              </div>
              <div className="text-sm text-slate-400">
                Expected Average: {Math.floor(totalAverage)}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFavouriteLabel}
                onChange={(e) => setNewFavouriteLabel(e.target.value)}
                placeholder="Enter label for favourite"
                className="px-2 py-1 text-sm rounded bg-slate-600 border border-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newFavouriteLabel.trim()) {
                    onAddFavourite(result.formula, newFavouriteLabel.trim())
                    setNewFavouriteLabel('')
                  }
                }}
                disabled={!newFavouriteLabel.trim()}
                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded transition-colors"
              >
                Add to Favourites
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 