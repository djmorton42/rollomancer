import { motion, AnimatePresence, AnimationProps } from 'framer-motion'
import type { RollResult } from '../utils/diceParser'

interface FavouriteEntry extends RollResult {
  id: number
  label: string
}

interface FavouritesProps {
  favourites: FavouriteEntry[]
  onRoll: (formula: string, label: string) => void
  onRemove: (id: number) => void
  onClearAll: () => void
}

export function Favourites({ favourites, onRoll, onRemove, onClearAll }: FavouritesProps) {
  return (
    <div className="bg-slate-700 rounded-lg p-4 lg:min-h-[400px] relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Favourites</h2>
        <button
          onClick={onClearAll}
          className="px-4 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {favourites.map((favourite) => {
            // Calculate total average
            const groupsAverage = favourite.groups.reduce((sum, group) => sum + group.average, 0)
            const groupsTotal = favourite.groups.reduce((sum, group) => sum + group.value, 0)
            const modifier = favourite.total - groupsTotal
            const totalAverage = Math.floor(groupsAverage + modifier)

            return (
              <motion.div
                key={favourite.id}
                initial={{ 
                  opacity: 0, 
                  x: 20,
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
                    backgroundColor: 'rgb(153 27 27)', // red-700
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
                className="p-2 bg-slate-800 rounded group relative overflow-hidden"
              >
                <div className="flex flex-col text-xs lg:text-slate-300">
                  <span className="font-medium">{favourite.label}</span>
                  <span className="lg:text-slate-300">
                    {favourite.formula} (avg: {totalAverage})
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-end px-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1 bg-slate-800 px-2 py-1 rounded">
                    <button
                      onClick={() => onRoll(favourite.formula, favourite.label)}
                      className="px-2 py-0.5 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      Roll
                    </button>
                    <button
                      onClick={() => onRemove(favourite.id)}
                      className="px-2 py-0.5 text-xs bg-slate-600 hover:bg-slate-700 rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
} 