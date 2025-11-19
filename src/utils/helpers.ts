export const roundNumber = (value: number): number => {
  if (value === Number.NEGATIVE_INFINITY || value === Number.POSITIVE_INFINITY) {
    return value
  }
  return Math.round(value * 10000) / 10000
}
