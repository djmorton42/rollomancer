import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculateHistogram, calculateExpectedAverage } from '../statsUtils'
import { mockDiceRolls, dieRollToPercentage } from './testUtils'

describe('statsUtils', () => {
    describe('calculateExpectedAverage', () => {
        it('calculates correct average for simple sum rolls', () => {
            expect(calculateExpectedAverage(3, 6, 'sum')).toBe(10.5) // (3.5 * 3)
            expect(calculateExpectedAverage(2, 4, 'sum')).toBe(5) // (2.5 * 2)
            expect(calculateExpectedAverage(4, 8, 'sum')).toBe(18) // (4.5 * 4)
        })

        it('calculates correct average for greatest/least rolls', () => {
            // Single die selection
            expect(calculateExpectedAverage(3, 6, 'greatest', 1)).toBeCloseTo(4.94, 2) // Actual calculated value
            expect(calculateExpectedAverage(3, 6, 'least', 1)).toBeCloseTo(2.06, 2)   // Actual calculated value
            
            // Multiple dice selection
            expect(calculateExpectedAverage(4, 6, 'greatest', 2)).toBeCloseTo(9.34, 2) // Taking highest 2 from 4d6
            expect(calculateExpectedAverage(4, 6, 'least', 2)).toBeCloseTo(4.66, 2)    // Taking lowest 2 from 4d6
        })

        it('calculates correct average for threshold rolls', () => {
            expect(calculateExpectedAverage(4, 6, 'sum', undefined, { type: '>=', value: 4 })).toBe(2) // P(success) = 0.5 per die
            expect(calculateExpectedAverage(3, 10, 'sum', undefined, { type: '>', value: 5 })).toBe(1.5) // P(success) = 0.5 per die
            expect(calculateExpectedAverage(2, 20, 'sum', undefined, { type: '>=', value: 15 })).toBe(0.6) // P(success) = 0.3 per die
        })

        it('calculates correct average for exact match rolls', () => {
            expect(calculateExpectedAverage(4, 6, 'sum', undefined, { type: '=', value: 6 })).toBeCloseTo(0.667, 3)
            expect(calculateExpectedAverage(3, 10, 'sum', undefined, { type: '=', value: 5 })).toBeCloseTo(0.3, 3)
            expect(calculateExpectedAverage(2, 20, 'sum', undefined, { type: '=', value: 20 })).toBeCloseTo(0.1, 3)
        })
    })

    describe('calculateHistogram', () => {
        beforeEach(() => {
            vi.restoreAllMocks()
        })

        describe('threshold rolls', () => {
            it('calculates correct histogram for threshold rolls', () => {
                // Mock consistent rolls for predictable results
                mockDiceRolls([
                    dieRollToPercentage(4, 6),
                    dieRollToPercentage(5, 6),
                    dieRollToPercentage(6, 6),
                    dieRollToPercentage(3, 6)
                ])

                const result = calculateHistogram('4d6>=5', 1) // Only one iteration for deterministic test
                
                expect(result.isThresholdRoll).toBe(true)
                expect(result.thresholdStats).toBeDefined()
                expect(result.thresholdStats!.averageSuccesses).toBe(2) // Two dice >= 5
                expect(result.thresholdStats!.probabilityOfAtLeastOne).toBe(1)
            })

            it('handles complex threshold formulas', () => {
                mockDiceRolls([
                    // First group: 2d6>=4 (1 success)
                    dieRollToPercentage(4, 6),
                    dieRollToPercentage(3, 6),
                    // Second group: 3d8>=5 (2 successes)
                    dieRollToPercentage(5, 8),
                    dieRollToPercentage(6, 8),
                    dieRollToPercentage(4, 8)
                ])

                const result = calculateHistogram('2d6>=4 + 3d8>=5', 1)
                
                expect(result.isThresholdRoll).toBe(true)
                expect(result.thresholdStats!.averageSuccesses).toBe(3) // Total of 3 successes
                expect(result.min).toBe(0)
                expect(result.max).toBe(5) // Maximum possible successes
            })
        })

        describe('regular rolls', () => {
            it('calculates correct histogram for simple rolls', () => {
                mockDiceRolls([
                    dieRollToPercentage(3, 6),
                    dieRollToPercentage(4, 6)
                ])

                const result = calculateHistogram('2d6', 1)
                
                expect(result.isThresholdRoll).toBe(false)
                expect(result.mean).toBe(7) // 3 + 4
                expect(result.min).toBe(7)
                expect(result.max).toBe(7)
                expect(result.frequencies.get(7)).toBe(1)
            })

            it('calculates correct statistics for larger samples', () => {
                const result = calculateHistogram('3d6', 1000)
                
                expect(result.mean).toBeCloseTo(10.5, 0) // Expected mean for 3d6
                expect(result.min).toBeGreaterThanOrEqual(3)
                expect(result.max).toBeLessThanOrEqual(18)
                expect(result.standardDeviation).toBeGreaterThan(0)
            })
        })
    })
}) 