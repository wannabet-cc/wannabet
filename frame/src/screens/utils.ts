function isInt(value: number) {
  return value % 1 === 0;
}

function isIntInRange(value: number, low: number, high: number) {
  const isAboveLow = value > low;
  const isBelowHigh = value < high;
  return isInt(value) && isAboveLow && isBelowHigh;
}

export { isIntInRange };
