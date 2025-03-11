// Types for different operations we can perform on dice rolls
export type DiceOperator = 'sum' | 'least' | 'greatest'

// Represents a single die roll
export interface DieResult {
    value: number
    sides: number
}

// Represents a group of dice (e.g., 3d6)
export interface DiceGroupResult {
    dice: DieResult[]
    sides: number
    count: number
    operator: DiceOperator
    value: number // The computed value after applying the operator
    average: number // The expected average value for this dice group
    takeCount?: number // 
    threshold?: ThresholdOperator
}

// The complete result of evaluating a formula
export interface RollResult {
    groups: DiceGroupResult[]
    total: number
    formula: string
    favouriteLabel?: string
}

export interface ThresholdOperator {
    type: '>=' | '>' | '='
    value: number
} 

export function rollDie(sides: number): DieResult {
    return {
        value: Math.floor(Math.random() * sides) + 1,
        sides
    }
}

function computeGroupValue(dice: DieResult[], operator: DiceOperator): number {
    switch (operator) {
        case 'sum':
            return dice.reduce((sum, die) => sum + die.value, 0)
        case 'least':
            return Math.min(...dice.map(die => die.value))
        case 'greatest':
            return Math.max(...dice.map(die => die.value))
        default:
            throw new Error(`Unknown operator: ${operator}`)
    }
}

export function createDiceGroup(count: number, sides: number, operator: DiceOperator = 'sum', takeCount?: number): DiceGroupResult {
    const dice = Array.from({ length: count }, () => rollDie(sides))
    return {
        dice,
        sides,
        count,
        operator,
        takeCount,
        value: computeGroupValue(dice, operator),
        average: calculateExpectedAverage(count, sides, operator, takeCount)
    }
}

function parseOneGroup(groupStr: string, skipAverages?: boolean): DiceGroupResult {
    let operator: DiceOperator = 'sum'
    let diceFormula = groupStr.trim()
    let takeCount: number | undefined
    let threshold: ThresholdOperator | undefined

    // Check for threshold operators (>=, >, =)
    const thresholdMatch = diceFormula.match(/(\d+)d(\d+)([>]=?|>|=)(\d+)/)
    if (thresholdMatch) {
        const [_, count, sides, op, value] = thresholdMatch
        const thresholdValue = parseInt(value)
        const dieSize = parseInt(sides)

        // Validate threshold value is within possible die results
        if (thresholdValue < 1) {
            throw new Error(`Threshold value ${thresholdValue} is invalid - dice cannot roll lower than 1`)
        }
        if (thresholdValue > dieSize) {
            throw new Error(`Threshold value ${thresholdValue} is invalid - d${dieSize} cannot roll higher than ${dieSize}`)
        }

        threshold = {
            type: op as '>=' | '>' | '=',
            value: thresholdValue
        }
        diceFormula = `${count}d${sides}`
    } else {
        // Your existing operator parsing code
        const takeMatch = diceFormula.match(/^(\d+)([<>])/)
        if (takeMatch) {
            takeCount = parseInt(takeMatch[1])
            operator = takeMatch[2] === '>' ? 'greatest' : 'least'
            diceFormula = diceFormula.slice(takeMatch[0].length)
        } else if (diceFormula.startsWith('>')) {
            operator = 'greatest'
            takeCount = 1
            diceFormula = diceFormula.slice(1)
        } else if (diceFormula.startsWith('<')) {
            operator = 'least'
            takeCount = 1
            diceFormula = diceFormula.slice(1)
        }
    }

    const diceRegex = /(\d+)d(\d+)/i
    const match = diceFormula.match(diceRegex)

    if (!match) {
        throw new Error(`Invalid dice group: ${groupStr}`)
    }

    const count = parseInt(match[1])
    const sides = parseInt(match[2])

    if (takeCount && takeCount > count) {
        throw new Error(`Cannot take ${takeCount} dice from ${count} dice`)
    }

    const group = createDiceGroup(count, sides, operator, takeCount)
    group.average = calculateExpectedAverage(count, sides, operator, takeCount, threshold)
    
    // If we have a threshold, count dice meeting the condition
    if (threshold) {
        group.threshold = threshold
        group.value = group.dice.filter(die => {
            return threshold.type === '=' 
                ? die.value === threshold.value
                : threshold.type === '>=' 
                    ? die.value >= threshold.value 
                    : die.value > threshold.value
        }).length
    } else if (takeCount) {
        const sortedValues = group.dice
            .map(d => d.value)
            .sort((a, b) => operator === 'greatest' ? b - a : a - b)
        group.value = sortedValues.slice(0, takeCount).reduce((sum, val) => sum + val, 0)
    }

    if (skipAverages) {
        group.average = 0
    }

    return group
}

export interface ParseDiceOptions {
    skipAverages?: boolean;
}

export function parseDiceFormula(formula: string, options: ParseDiceOptions = {}): RollResult {
    const displayFormula = formula.replace(/\s+/g, '')
    const parts = displayFormula.split(/(?=[-+])/)
    
    const groups: DiceGroupResult[] = []
    let modifier = 0

    for (const part of parts) {
        const isSubtraction = part.startsWith('-')
        const cleanPart = part.replace(/^[+-]/, '')

        // Updated regex to handle both traditional and threshold formulas
        if (/^(\d+[<>])?[<>]?\d+d\d+(?:(?:[>]=?|>|=)\d+)?$/i.test(cleanPart)) {
            const group = parseOneGroup(cleanPart, options.skipAverages)
            if (isSubtraction) {
                group.value = -group.value
            }
            groups.push(group)
        } else if (/^\d+$/.test(cleanPart)) {
            const num = parseInt(cleanPart)
            modifier += isSubtraction ? -num : num
        } else if (cleanPart === '') {
            continue
        } else {
            throw new Error(`Invalid formula part: ${cleanPart}`)
        }
    }

    if (groups.length === 0) {
        throw new Error('No valid dice groups found in formula')
    }

    return {
        groups,
        total: groups.reduce((sum, group) => sum + group.value, 0) + modifier,
        formula: displayFormula
    }
}

export type { HistogramResult } from './statsUtils'

import { calculateExpectedAverage } from './statsUtils'