import { type RollResult, type DiceGroupResult } from '../utils/diceParser'

interface ResultsProps {
  result: RollResult | null
}

function DiceGroup({ group }: { group: DiceGroupResult }) {
  const operatorSymbol = {
    sum: '∑',
    greatest: 'max',
    least: 'min'
  }[group.operator]

  return (
    <div className="border-t border-slate-600 pt-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold">
          {group.count}d{group.sides} 
          <span className="text-blue-400 ml-1">
            ({operatorSymbol})
          </span>:
        </span>
        <div className="flex flex-wrap gap-2">
          {group.dice.map((die, diceIndex) => (
            <span
              key={diceIndex}
              className="inline-block bg-slate-600 px-3 py-1 rounded-full text-sm"
            >
              {die.value}
            </span>
          ))}
        </div>
      </div>
      <div className="text-sm text-slate-300">
        Group Total: {group.value}
      </div>
    </div>
  )
}

export function Results({ result }: ResultsProps) {
  if (!result) return null

  // Extract numeric modifiers by comparing groups total to final total
  const groupsTotal = result.groups.reduce((sum, group) => sum + group.value, 0)
  const modifier = result.total - groupsTotal

  return (
    <div className="bg-slate-700 rounded-lg p-4 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Roll Results</h2>
        <div className="text-slate-300">Formula: {result.formula}</div>
      </div>

      <div className="space-y-4">
        {result.groups.map((group, index) => (
          <DiceGroup key={index} group={group} />
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-600">
        {modifier !== 0 && (
          <div className="text-slate-300 mb-2">
            Modifier: {modifier > 0 ? '+' : ''}{modifier}
          </div>
        )}
        <div className="text-xl font-bold">
          Total: {result.total}
        </div>
      </div>
    </div>
  )
} 