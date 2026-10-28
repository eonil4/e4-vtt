'use client';

import { useState } from 'react';

const defaultFormula = '1d20+5';

export default function HomePage() {
  const [formula, setFormula] = useState(defaultFormula);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function rollDice() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/dice/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula, system: 'star-wars-revised-edition' }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const json = await response.json();
      setResult(json);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">E4 VTT MVP</p>
        <h1>Star Wars Revised Edition foundation</h1>
        <p className="subtitle">
          This scaffold proves the initial authoritative backend and dice flow before broader feature expansion.
        </p>

        <div className="controls">
          <label htmlFor="formula">Formula</label>
          <div className="row">
            <input
              id="formula"
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
              placeholder="1d20+5"
            />
            <button onClick={rollDice} disabled={loading}>
              {loading ? 'Rolling...' : 'Roll'}
            </button>
          </div>
        </div>

        {result ? (
          <pre className="result-box">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </section>
    </main>
  );
}
