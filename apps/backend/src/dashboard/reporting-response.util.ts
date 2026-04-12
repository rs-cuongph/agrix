export function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function rankRows<T>(rows: T[], accessor: (row: T) => number) {
  let currentRank = 0;
  let previousValue: number | null = null;

  return rows.map((row, index) => {
    const currentValue = accessor(row);
    if (previousValue === null || currentValue !== previousValue) {
      currentRank = index + 1;
      previousValue = currentValue;
    }

    return {
      ...row,
      rank: currentRank,
    };
  });
}
