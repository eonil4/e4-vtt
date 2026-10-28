import { describe, expect, it } from 'vitest';
import { evaluateDiceFormula } from './dice';

describe('evaluateDiceFormula', () => {
  it('returns a valid roll structure for a d20 formula', () => {
    const result = evaluateDiceFormula('1d20+5', 'star-wars-revised-edition');

    expect(result.system).toBe('star-wars-revised-edition');
    expect(result.formula).toBe('1d20+5');
    expect(Array.isArray(result.rolls)).toBe(true);
    expect(result.rolls).toHaveLength(1);
    expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
    expect(result.rolls[0]).toBeLessThanOrEqual(20);
    expect(result.modifier).toBe(5);
    expect(result.total).toBeGreaterThanOrEqual(6);
    expect(result.total).toBeLessThanOrEqual(25);
  });

  it('rejects unsupported formulas', () => {
    expect(() => evaluateDiceFormula('invalid', 'test')).toThrowError(
      'Unsupported formula format. Use <count>d<sides>+/-<modifier>'
    );
  });
});
