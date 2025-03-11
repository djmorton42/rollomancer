import { describe, it, expect } from 'vitest'
import { addToFormula } from '../formulaUtils'

describe('formulaUtils', () => {
  describe('addToFormula', () => {
    it('adds first dice to empty formula', () => {
      expect(addToFormula('', '1d6')).toBe('1d6')
    })

    it('combines same type dice at the end', () => {
      expect(addToFormula('1d6', '1d6')).toBe('2d6')
      expect(addToFormula('2d6', '1d6')).toBe('3d6')
      expect(addToFormula('1d6 + 2d8', '1d8')).toBe('1d6 + 3d8')
    })

    it('adds different dice types with plus', () => {
      expect(addToFormula('1d6', '1d8')).toBe('1d6 + 1d8')
      expect(addToFormula('2d10', '1d4')).toBe('2d10 + 1d4')
    })

    it('combines modifiers at the end', () => {
      expect(addToFormula('1d6 + 2', '+3')).toBe('1d6 + 5')
      expect(addToFormula('2d8 + 1', '+2')).toBe('2d8 + 3')
    })

    it('adds new modifiers with plus', () => {
      expect(addToFormula('1d6', '+2')).toBe('1d6 + 2')
      expect(addToFormula('2d8', '+3')).toBe('2d8 + 3')
    })

    it('maintains spaces consistently', () => {
      expect(addToFormula('1d6 + 2d8', '1d8')).toBe('1d6 + 3d8')
      expect(addToFormula('1d6 + 2d8', '1d4')).toBe('1d6 + 2d8 + 1d4')
      expect(addToFormula('1d6+2d8', '1d8')).toBe('1d6 + 3d8')
    })
  })
}) 