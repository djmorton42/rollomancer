import { type RollResult } from '../utils/diceParser'

interface ResultsProps {
  result: RollResult | null
}

export function Results({ result }: ResultsProps) {
  if (!result) return null

  return (
    <div className="bg-slate-700 rounded-lg p-4 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Roll Results</h2>
        <div className="text-slate-300">Formula: {result.formula}</div>
      </div>

      <div className="space-y-4">
        {result.rolls.map((roll, index) => (
          <div key={index} className="border-t border-slate-600 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold">{roll.count}d{roll.sides}:</span>
              <div className="flex flex-wrap gap-2">
                {roll.results.map((value, diceIndex) => (
                  <span
                    key={diceIndex}
                    className="inline-block bg-slate-600 px-3 py-1 rounded-full text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-sm text-slate-300">
              Subtotal: {roll.total}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-600">
        <div className="text-xl font-bold">
          Total: {result.total}
        </div>
      </div>
    </div>
  )
} 