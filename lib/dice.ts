export function evaluateDiceFormula(formula: string, system: string) {
  const normalized = formula.trim();
  if (!normalized) {
    throw new Error('Formula is required');
  }

  const match = normalized.match(/^([0-9]+)d([0-9]+)([+-][0-9]+)?$/i);
  if (!match) {
    throw new Error('Unsupported formula format. Use <count>d<sides>+/-<modifier>');
  }

  const count = Number(match[1]);
  const sides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;

  if (count <= 0 || sides <= 0) {
    throw new Error('Dice count and sides must be positive numbers');
  }

  const rolls: number[] = [];
  let total = 0;

  for (let index = 0; index < count; index += 1) {
    const value = Math.floor(Math.random() * sides) + 1;
    rolls.push(value);
    total += value;
  }

  total += modifier;

  return {
    system,
    formula: normalized,
    rolls,
    modifier,
    total,
    breakdown: `${rolls.join(' + ')} ${modifier >= 0 ? '+' : '-'} ${Math.abs(modifier)}`,
  };
}
