import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { parseDiceFormula, type DiceOperator, createDiceGroup } from '../diceParser'
import { mockDiceRolls, dieRollToPercentage } from './testUtils'

describe('diceParser', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    // TODO double check these errors are what we want in these scenarios
    it('throws error for invalid formula', () => {
        expect(() => parseDiceFormula('>')).toThrow('Invalid formula part: >')
        expect(() => parseDiceFormula('>+')).toThrow('Invalid formula part: >')
        expect(() => parseDiceFormula('>')).toThrow('Invalid formula part: >')
    })

    it('correctly evaluates "1d1+1" with sum operator', () => {
        const result = parseDiceFormula('1d1+1')

        expect(result.formula).toBe('1d1+1')
        expect(result.groups).toHaveLength(1)

        const group = result.groups[0]
        expect(group.count).toBe(1)
        expect(group.sides).toBe(1)
        expect(group.operator).toBe('sum')
        expect(group.dice).toHaveLength(1)
        expect(group.dice[0].value).toBe(1)
        expect(group.dice[0].sides).toBe(1)
        expect(group.value).toBe(1)

        expect(result.total).toBe(2) // 1 from dice + 1 from modifier
    })

    describe('basic formula parsing', () => {
        beforeEach(() => {
            mockDiceRolls(
                [
                    dieRollToPercentage(4, 10),
                    dieRollToPercentage(8, 10),
                    dieRollToPercentage(2, 10),

                    dieRollToPercentage(4, 10),
                    dieRollToPercentage(8, 10),
                    dieRollToPercentage(2, 10),

                    dieRollToPercentage(4, 10),
                    dieRollToPercentage(8, 10),
                    dieRollToPercentage(2, 10),
                ]
            )
        })

        it('computes correct values for different operators', () => {
            const testOperators: DiceOperator[] = ['sum', 'least', 'greatest']
            const expectedValues = {
                sum: 14,      // 4 + 8 + 2
                least: 2,     // min(4, 8, 2)
                greatest: 8    // max(4, 8, 2)
            }

            testOperators.forEach(operator => {
                const group = createDiceGroup(3, 10, operator)
                expect(group.value).toBe(expectedValues[operator])
            })

        })

        it('correctly evaluates "3d10" with default sum operator', () => {
            const result = parseDiceFormula('3d10')

            expect(result.formula).toBe('3d10')
            expect(result.groups[0].operator).toBe('sum')
            expect(result.groups[0].value).toBe(14) // 4 + 8 + 2
            expect(result.total).toBe(14)
        })

        it('correctly evaluates ">3d10" with greatest operator', () => {
            const result = parseDiceFormula('>3d10')

            expect(result.formula).toBe('>3d10')
            expect(result.groups[0].operator).toBe('greatest')
            expect(result.groups[0].value).toBe(8) // max of 4, 8, 2
            expect(result.total).toBe(8)
        })

        it('correctly evaluates "<3d10" with least operator', () => {
            const result = parseDiceFormula('<3d10')

            expect(result.formula).toBe('<3d10')
            expect(result.groups[0].operator).toBe('least')
            expect(result.groups[0].value).toBe(2) // min of 4, 8, 2
            expect(result.total).toBe(2)
        })

        it('correctly handles modifiers with greatest operator', () => {
            const result = parseDiceFormula('>3d10+5')

            expect(result.formula).toBe('>3d10+5')
            expect(result.groups[0].operator).toBe('greatest')
            expect(result.groups[0].value).toBe(8) // max of 4, 8, 2
            expect(result.total).toBe(13) // 8 + 5
        })

        it('correctly handles modifiers with least operator', () => {
            const result = parseDiceFormula('<3d10+5')

            expect(result.formula).toBe('<3d10+5')
            expect(result.groups[0].operator).toBe('least')
            expect(result.groups[0].value).toBe(2) // min of 4, 8, 2
            expect(result.total).toBe(7) // 2 + 5
        })

        it('correctly handles modifiers with sum operator', () => {
            const result = parseDiceFormula('3d10+5')

            expect(result.formula).toBe('3d10+5')
            expect(result.groups[0].operator).toBe('sum')
            expect(result.groups[0].value).toBe(14) // 4 + 8 + 2
            expect(result.total).toBe(19) // 14 + 5
        })
    })

    describe('multiple dice groups', () => {
        beforeEach(() => {
            mockDiceRolls(
                [
                    dieRollToPercentage(4, 10),
                    dieRollToPercentage(8, 10),
                    dieRollToPercentage(2, 10),

                    dieRollToPercentage(3, 8),
                    dieRollToPercentage(7, 8),
                ]
            )
        })

        it('correctly handles two groups of dice', () => {
            const result = parseDiceFormula('3d10 + 2d8')

            expect(result.formula).toBe('3d10+2d8')
            expect(result.groups).toHaveLength(2)

            expect(result.groups[0].operator).toBe('sum')
            expect(result.groups[0].value).toBe(14) // 4 + 8 + 2

            expect(result.groups[1].operator).toBe('sum')
            expect(result.groups[1].value).toBe(10) // 3 + 7
            expect(result.total).toBe(24) // 14 + 10
        })
    })

    describe('formulas subtracting one gropu from another', () => {
        beforeEach(() => {
            mockDiceRolls(
                [
                    dieRollToPercentage(1, 6),
                    dieRollToPercentage(3, 6),
                    dieRollToPercentage(5, 6),
                    dieRollToPercentage(2, 6),
                    dieRollToPercentage(4, 6),
                    dieRollToPercentage(2, 6),
                    dieRollToPercentage(2, 4),
                ]
            )
        })

        it('correctly evaluates formulas with subtracting one group from another like  "6d6 - 1d4"', () => {
            const result = parseDiceFormula('6d6 - 1d4')
            
            expect(result.formula).toBe('6d6-1d4')
            expect(result.groups).toHaveLength(2)
            
            // First group (6d6)
            expect(result.groups[0].value).toBe(17) // 1 + 3 + 5 + 2 + 4 + 2
            
            // Second group (1d4)
            expect(result.groups[1].value).toBe(-2) // -2
            
            // Total with modifier
            expect(result.total).toBe(15) // 17 - 2
        }) 

        it('correctly evaluates formulas with subtracting one group from another with a positive modifier like  "6d6 - 1d4 + 1"', () => {
            const result = parseDiceFormula('6d6 - 1d4 + 1')
            
            expect(result.formula).toBe('6d6-1d4+1')
            expect(result.groups).toHaveLength(2)
            
            // First group (6d6)
            expect(result.groups[0].value).toBe(17) // 1 + 3 + 5 + 2 + 4 + 2
            
            // Second group (1d4)
            expect(result.groups[1].value).toBe(-2) // -2

            // Total with modifier
            expect(result.total).toBe(16) // 17 - 2 + 1
        })
    })

    describe('complex formulas', () => {
        beforeEach(() => {
            mockDiceRolls(
                [
                    dieRollToPercentage(4, 10),
                    dieRollToPercentage(8, 10),
                    dieRollToPercentage(2, 10),
                    dieRollToPercentage(5, 8),
                    dieRollToPercentage(7, 8),
                ]
            )
        })

        it('correctly evaluates "3d10 + 2d8"', () => {
          const result = parseDiceFormula('3d10 + 2d8')
          
          expect(result.formula).toBe('3d10+2d8')
          expect(result.groups).toHaveLength(2)
          
          // First group (3d10)
          expect(result.groups[0].dice).toHaveLength(3)
          expect(result.groups[0].value).toBe(14) // 4 + 8 + 2
          
          // Second group (2d8)
          expect(result.groups[1].dice).toHaveLength(2)
          expect(result.groups[1].value).toBe(12) // 5 + 7
          
          // Total
          expect(result.total).toBe(26) // 14 + 12
        })

        it('correctly evaluates "3d10 + 2d8 + 5"', () => {
          const result = parseDiceFormula('3d10 + 2d8 + 5')
          
          expect(result.formula).toBe('3d10+2d8+5')
          expect(result.groups).toHaveLength(2)
          
          // First group (3d10)
          expect(result.groups[0].value).toBe(14) // 4 + 8 + 2
          
          // Second group (2d8)
          expect(result.groups[1].value).toBe(12) // 5 + 7
          
          // Total with modifier
          expect(result.total).toBe(31) // 14 + 12 + 5
        })

        it('correctly evaluates formulas with negative modifiers like  "3d10 + 2d8 - 1"', () => {
            const result = parseDiceFormula('3d10 + 2d8 - 1')
            
            expect(result.formula).toBe('3d10+2d8-1')
            expect(result.groups).toHaveLength(2)
            
            // First group (3d10)
            expect(result.groups[0].value).toBe(14) // 4 + 8 + 2
            
            // Second group (2d8)
            expect(result.groups[1].value).toBe(12) // 5 + 7
            
            // Total with modifier
            expect(result.total).toBe(25) // 14 + 12 -1
        })               

        it('correctly evaluates "<3d10 + >2d8"', () => {
          const result = parseDiceFormula('<3d10 + >2d8')
          
          expect(result.formula).toBe('<3d10+>2d8')
          expect(result.groups).toHaveLength(2)
          
          // First group (<3d10)
          expect(result.groups[0].operator).toBe('least')
          expect(result.groups[0].value).toBe(2) // min(4, 8, 2)
          
          // Second group (>2d8)
          expect(result.groups[1].operator).toBe('greatest')
          expect(result.groups[1].value).toBe(7) // max(5, 7)
          
          // Total
          expect(result.total).toBe(9) // 7 + 2
        })

        it('throws error for invalid formula parts', () => {
          expect(() => parseDiceFormula('3d10 + abc')).toThrow('Invalid formula part: abc')
          expect(() => parseDiceFormula('3d10 + 2d')).toThrow('Invalid formula part: 2d')
          expect(() => parseDiceFormula('+')).toThrow('No valid dice groups found in formula')
        })
    })

    describe('complex advantage and disadvantage formulas', () => {
        beforeEach(() => {
            mockDiceRolls(
                [
                    dieRollToPercentage(3, 6),
                    dieRollToPercentage(1, 6),
                    dieRollToPercentage(5, 6),
                    dieRollToPercentage(4, 6),
                    dieRollToPercentage(3, 6),
                    dieRollToPercentage(1, 6),
                    dieRollToPercentage(5, 6),
                    dieRollToPercentage(4, 6),
                ]
            )
        })

        it('correctly evaluates "3>4d6"', () => {
          const result = parseDiceFormula('3>4d6')
          
          expect(result.formula).toBe('3>4d6')
          expect(result.groups).toHaveLength(1)
          
          expect(result.total).toBe(12) // 3 + 4 + 5
        })

        it('correctly evaluates "3<4d6"', () => {
            const result = parseDiceFormula('3<4d6')
            
            expect(result.formula).toBe('3<4d6')
            expect(result.groups).toHaveLength(1)
            
            expect(result.total).toBe(8) // 3 + 1 + 4
        })
  
        it('correctly evaluates "3<4d6 + 1d6"', () => {
            const result = parseDiceFormula('3<4d6 + 1d6')
            
            expect(result.formula).toBe('3<4d6+1d6')
            expect(result.groups).toHaveLength(2)
            
            expect(result.total).toBe(11) // 3 + 1 + 4 + 3
        })
    })
}) 