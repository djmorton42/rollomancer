export function addToFormula(currentFormula: string, addition: string): string {
  const formula = currentFormula.trim()
  
  if (formula === '') {
    return addition
  }

  // Split on operators while keeping them in the array
  const parts = formula.split(/(\s*[+-]\s*)/).filter(Boolean)
  const lastPart = parts[parts.length - 1].trim()

  if (addition.startsWith('+')) {
    // Handle modifier addition
    if (/^\d+$/.test(lastPart)) {
      // If last part is a number (modifier), add them together
      const currentMod = parseInt(lastPart)
      const newMod = parseInt(addition.substring(1))
      parts[parts.length - 1] = `${currentMod + newMod}`
      // Reconstruct with consistent spacing
      return parts.slice(0, -1).join('').replace(/\s*([+-])\s*/g, ' $1 ') + parts[parts.length - 1]
    }
    // Otherwise just append the new modifier with consistent spacing
    return `${formula} + ${addition.substring(1)}`
  }

  // Handle dice addition (e.g., "1d6")
  const [count, sides] = addition.split('d')
  const diceMatch = lastPart.match(/^(\d+)d(\d+)$/)
  
  if (diceMatch && diceMatch[2] === sides) {
    // If last part matches the dice type, increment the count
    const currentCount = parseInt(diceMatch[1])
    const newCount = currentCount + parseInt(count)
    parts[parts.length - 1] = `${newCount}d${sides}`
    // Reconstruct with consistent spacing
    return parts.slice(0, -1).join('').replace(/\s*([+-])\s*/g, ' $1 ') + parts[parts.length - 1]
  }

  // Otherwise append as new dice group with consistent spacing
  return `${formula}`.replace(/\s*([+-])\s*/g, ' $1 ') + ` + ${addition}`
} 