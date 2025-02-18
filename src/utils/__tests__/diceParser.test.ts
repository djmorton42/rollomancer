import { describe, it, expect } from 'vitest'
import { parseDiceFormula } from '../diceParser'

describe('diceParser', () => {
  it('correctly evaluates "1d1+1"', () => {
    const result = parseDiceFormula('1d1+1')
    
    expect(result.formula).toBe('1d1+1')
    expect(result.rolls).toHaveLength(1)
    expect(result.rolls[0].count).toBe(1)
    expect(result.rolls[0].sides).toBe(1)
    expect(result.rolls[0].results).toEqual([1])
    expect(result.total).toBe(2) // 1 from dice + 1 from modifier
  })
}) 