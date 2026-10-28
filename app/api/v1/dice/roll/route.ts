import { NextResponse } from 'next/server';
import { evaluateDiceFormula } from '@/lib/dice';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formula = typeof body.formula === 'string' ? body.formula : '1d20+0';
    const system = typeof body.system === 'string' ? body.system : 'generic';

    const result = evaluateDiceFormula(formula, system);

    return NextResponse.json({
      ok: true,
      system,
      formula,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      },
      { status: 400 }
    );
  }
}
