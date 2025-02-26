import { vi } from 'vitest'

export function dieRollToPercentage(roll: number, sides: number) : number {   
    return (roll - 0.5) / sides
}

export function mockDiceRolls(values: number[]) {
  //vi.spyOn(Math, 'random').mockReset()
  values.forEach(value => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(value)
  })
} 