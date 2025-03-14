import { DiceOperator, ThresholdOperator } from './diceParser'

export interface HistogramResult {
  min: number;
  max: number;
  frequencies: Map<number, number>;
  totalRolls: number;
  mean: number;
  standardDeviation: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  isThresholdRoll?: boolean;
  thresholdStats?: {
    averageSuccesses: number;
    probabilityOfAtLeastOne: number;
    successProbabilities: Map<number, number>; // Map of success count to probability
  };
}

function calculateHistogramRoll(formula: string): number {
    const displayFormula = formula.replace(/\s+/g, '');
    const parts = displayFormula.split(/(?=[-+])/);
    let total = 0;

    for (const part of parts) {
        const isSubtraction = part.startsWith('-');
        const cleanPart = part.replace(/^[+-]/, '');

        // Check if this part is a threshold roll
        const thresholdMatch = cleanPart.match(/(\d+)d(\d+)([>]=?|>|=)(\d+)/);
        if (thresholdMatch) {
            const [_, count, sides, op, value] = thresholdMatch;
            const threshold = parseInt(value);
            
            let successes = 0;
            for (let i = 0; i < parseInt(count); i++) {
                const roll = Math.floor(Math.random() * parseInt(sides)) + 1;
                if (op === '=' 
                    ? roll === threshold
                    : op === '>=' 
                        ? roll >= threshold 
                        : roll > threshold) {
                    successes++;
                }
            }
            total += isSubtraction ? -successes : successes;
        } else if (/^(\d+[<>])?[<>]?\d+d\d+$/i.test(cleanPart)) {
            // Fast path for take highest/lowest rolls
            const takeMatch = cleanPart.match(/^(\d+)([<>])/);
            let takeCount: number | undefined;
            let operator: 'greatest' | 'least' = 'greatest';
            let diceFormula = cleanPart;
            
            if (takeMatch) {
                takeCount = parseInt(takeMatch[1]);
                operator = takeMatch[2] === '>' ? 'greatest' : 'least';
                diceFormula = diceFormula.slice(takeMatch[0].length);
            } else if (diceFormula.startsWith('>')) {
                takeCount = 1;
                operator = 'greatest';
                diceFormula = diceFormula.slice(1);
            } else if (diceFormula.startsWith('<')) {
                takeCount = 1;
                operator = 'least';
                diceFormula = diceFormula.slice(1);
            }

            const match = diceFormula.match(/(\d+)d(\d+)/);
            if (!match) throw new Error(`Invalid dice group: ${cleanPart}`);
            
            const count = parseInt(match[1]);
            const sides = parseInt(match[2]);
            
            if (takeCount) {
                const rolls = Array.from({ length: count }, 
                    () => Math.floor(Math.random() * sides) + 1
                );
                rolls.sort((a, b) => operator === 'greatest' ? b - a : a - b);
                const value = rolls.slice(0, takeCount).reduce((a, b) => a + b, 0);
                total += isSubtraction ? -value : value;
            } else {
                // Simple sum
                let sum = 0;
                for (let i = 0; i < count; i++) {
                    sum += Math.floor(Math.random() * sides) + 1;
                }
                total += isSubtraction ? -sum : sum;
            }
        } else if (/^\d+$/.test(cleanPart)) {
            const num = parseInt(cleanPart);
            total += isSubtraction ? -num : num;
        }
    }

    return total;
}

export function calculateHistogram(formula: string, iterations = 100000): HistogramResult {
    const isThresholdRoll = /\d+d\d+([>]=?|>|=)\d+/.test(formula);

    if (isThresholdRoll) {
        const frequencies = new Map<number, number>();
        let totalSuccesses = 0;
        let atLeastOneCount = 0;

        // Calculate max possible successes by analyzing formula
        let maxPossibleSuccesses = 0;
        let minPossibleSuccesses = 0;
        const parts = formula.replace(/\s+/g, '').split(/(?=[-+])/);
        
        for (const part of parts) {
            const isSubtraction = part.startsWith('-');
            const cleanPart = part.replace(/^[+-]/, '');
            
            const thresholdMatch = cleanPart.match(/(\d+)d(\d+)([>]=?|>|=)(\d+)/);
            if (thresholdMatch) {
                const diceCount = parseInt(thresholdMatch[1]);
                if (isSubtraction) {
                    minPossibleSuccesses -= diceCount;
                } else {
                    maxPossibleSuccesses += diceCount;
                }
            } else if (/^\d+$/.test(cleanPart)) {
                const num = parseInt(cleanPart);
                if (isSubtraction) {
                    minPossibleSuccesses -= num;
                    maxPossibleSuccesses -= num;
                } else {
                    minPossibleSuccesses += num;
                    maxPossibleSuccesses += num;
                }
            }
        }

        for (let i = 0; i < iterations; i++) {
            const roll = calculateHistogramRoll(formula);
            frequencies.set(roll, (frequencies.get(roll) || 0) + 1);
            totalSuccesses += roll;
            if (roll > 0) atLeastOneCount++;
        }

        // Ensure we have entries for all possible success counts
        for (let i = minPossibleSuccesses; i <= maxPossibleSuccesses; i++) {
            if (!frequencies.has(i)) {
                frequencies.set(i, 0);
            }
        }

        // Calculate success probabilities
        const successProbabilities = new Map(
            Array.from(frequencies.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([k, v]) => [k, v / iterations])
        );

        return {
            isThresholdRoll: true,
            frequencies,
            totalRolls: iterations,
            min: minPossibleSuccesses,
            max: maxPossibleSuccesses,
            mean: totalSuccesses / iterations,
            standardDeviation: 0,
            percentiles: {
                p25: 0, p50: 0, p75: 0, p90: 0, p95: 0, p99: 0
            },
            thresholdStats: {
                averageSuccesses: totalSuccesses / iterations,
                probabilityOfAtLeastOne: atLeastOneCount / iterations,
                successProbabilities
            }
        };
    }

    // Original histogram calculation for non-threshold rolls
    const frequencies = new Map<number, number>();
    const allValues: number[] = [];
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    let sum = 0;

    for (let i = 0; i < iterations; i++) {
        const total = calculateHistogramRoll(formula);
        allValues.push(total);
        sum += total;
        frequencies.set(total, (frequencies.get(total) || 0) + 1);
        min = Math.min(min, total);
        max = Math.max(max, total);
    }

    // Calculate mean
    const mean = sum / iterations;

    // Calculate standard deviation
    const squaredDiffs = allValues.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / iterations;
    const standardDeviation = Math.sqrt(variance);

    // Sort values for percentile calculations
    allValues.sort((a, b) => a - b);

    // Calculate percentiles
    const getPercentile = (p: number) => {
        const index = Math.ceil((p / 100) * iterations) - 1;
        return allValues[index];
    };

    // Sort the frequencies map by keys
    const sortedFrequencies = new Map(
        [...frequencies.entries()].sort((a, b) => a[0] - b[0])
    );

    return {
        isThresholdRoll: false,
        min,
        max,
        frequencies: sortedFrequencies,
        totalRolls: iterations,
        mean,
        standardDeviation,
        percentiles: {
            p25: getPercentile(25),
            p50: getPercentile(50),
            p75: getPercentile(75),
            p90: getPercentile(90),
            p95: getPercentile(95),
            p99: getPercentile(99)
        }
    };
}

function calculateThresholdAverage(count: number, sides: number, threshold: number, operator: '>=' | '>' | '='): number {
    // Calculate probability of a single die succeeding
    const successProbability = operator === '=' 
        ? 1 / sides
        : operator === '>=' 
            ? (sides - threshold + 1) / sides
            : (sides - threshold) / sides;
    
    // For a binomial distribution, expected value is n*p
    return count * successProbability;
}

function calculateAverageForTakeN(count: number, sides: number, operator: DiceOperator, takeCount: number): number {
    let sum = 0
    const allCombinations = Math.pow(sides, count) // Total possible combinations
    
    // For each possible combination of dice
    for (let i = 0; i < allCombinations; i++) {
        const rolls: number[] = []
        let temp = i
        
        // Convert number to dice rolls
        for (let j = 0; j < count; j++) {
            rolls.push((temp % sides) + 1)
            temp = Math.floor(temp / sides)
        }
        
        // Sort rolls and take N based on operator
        rolls.sort((a, b) => operator === 'greatest' ? b - a : a - b)
        const value = rolls.slice(0, takeCount).reduce((a, b) => a + b, 0)
        sum += value
    }
    
    return sum / allCombinations
}

export function calculateExpectedAverage(count: number, sides: number, operator: DiceOperator, takeCount?: number, threshold?: ThresholdOperator): number {
    if (threshold) {
        return calculateThresholdAverage(
            count,
            sides,
            threshold.value,
            threshold.type === '>=' ? '>=' : threshold.type === '>' ? '>' : '='
        );
    }

    switch (operator) {
        case 'sum':
            return (sides + 1) / 2 * count
        case 'greatest': {
            if (!takeCount || takeCount === 1) {
                const term = (1 - 1.0 / (2 * sides))
                return sides * (1 - (1.0 / (count + 1)) * Math.pow(term, count + 1))
            }
            return calculateAverageForTakeN(count, sides, operator, takeCount)
        }
        case 'least': {
            if (!takeCount || takeCount === 1) {
                const term = (1 - 1.0 / (2 * sides))
                const greatestAvg = sides * (1 - (1.0 / (count + 1)) * Math.pow(term, count + 1))
                return sides + 1 - greatestAvg
            }
            return calculateAverageForTakeN(count, sides, operator, takeCount)
        }
        default:
            throw new Error(`Unknown operator: ${operator}`)
    }
} 