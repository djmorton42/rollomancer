export interface DiceRoll {
  sides: number;
  count: number;
  results: number[];
  total: number;
}

export interface RollResult {
  rolls: DiceRoll[];
  total: number;
  formula: string;
}

export function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function parseDiceFormula(formula: string): RollResult {
  // Remove all spaces from the formula
  formula = formula.replace(/\s+/g, '');
  
  // Split the formula into dice roll and modifier
  const [diceRoll, modifier] = formula.split('+');
  
  const diceRegex = /(\d+)d(\d+)/i;
  const match = diceRoll.match(diceRegex);
  
  if (!match) {
    throw new Error('Invalid dice formula');
  }

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const results = Array.from({ length: count }, () => rollDice(sides));
  
  const roll: DiceRoll = {
    sides,
    count,
    results,
    total: results.reduce((sum, num) => sum + num, 0)
  };

  const modifierValue = modifier ? parseInt(modifier) : 0;

  return {
    rolls: [roll],
    total: roll.total + modifierValue,
    formula
  };
} 