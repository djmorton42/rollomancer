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
}

// The complete result of evaluating a formula
export interface RollResult {
    groups: DiceGroupResult[]
    total: number
    formula: string
    favouriteLabel?: string
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

export function createDiceGroup(count: number, sides: number, operator: DiceOperator = 'sum'): DiceGroupResult {
    const dice = Array.from({ length: count }, () => rollDie(sides))
    console.log('Dice Rolled: ', dice)
    return {
        dice,
        sides,
        count,
        operator,
        value: computeGroupValue(dice, operator)
    }
}

function parseOneGroup(groupStr: string): DiceGroupResult {
    let operator: DiceOperator = 'sum'
    let diceFormula = groupStr.trim()

    if (diceFormula.startsWith('>')) {
        operator = 'greatest'
        diceFormula = diceFormula.slice(1)
    } else if (diceFormula.startsWith('<')) {
        operator = 'least'
        diceFormula = diceFormula.slice(1)
    }

    const diceRegex = /(\d+)d(\d+)/i
    const match = diceFormula.match(diceRegex)

    if (!match) {
        throw new Error(`Invalid dice group: ${groupStr}`)
    }

    const count = parseInt(match[1])
    const sides = parseInt(match[2])

    return createDiceGroup(count, sides, operator)
}

export function parseDiceFormula(formula: string): RollResult {
    // Store the original formula for display
    const displayFormula = formula.replace(/\s+/g, '')
    
    // Convert minuses to '+-' for parsing, but only internally
    const workingFormula = displayFormula.replace(/\s*-\s*/g, '+-')
    
    // Split into parts that might be dice or modifiers
    const parts = workingFormula.split('+')
    
    const diceRegex = /^[<>]?\d+d\d+$/i
    const numberRegex = /^-?\d+$/
    
    const groups: DiceGroupResult[] = []
    let modifier = 0

    for (const part of parts) {
        if (diceRegex.test(part)) {
            groups.push(parseOneGroup(part))
        } else if (numberRegex.test(part)) {
            modifier += parseInt(part)
        } else if (part === '') {
            continue
        } else {
            throw new Error(`Invalid formula part: ${part}`)
        }
    }

    if (groups.length === 0) {
        throw new Error('No valid dice groups found in formula')
    }

    const groupsTotal = groups.reduce((sum, group) => sum + group.value, 0)

    return {
        groups,
        total: groupsTotal + modifier,
        formula: displayFormula  // Use the original, cleaned formula for display
    }
} 