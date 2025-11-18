// Helper function to round numbers to 4 decimal places
export const roundNumber = (value: number): number => {
  if (value === Number.NEGATIVE_INFINITY || value === Number.POSITIVE_INFINITY) {
    return value // Preserve Infinity values
  }
  return Math.round(value * 10000) / 10000 // Round to 4 decimal places
}
