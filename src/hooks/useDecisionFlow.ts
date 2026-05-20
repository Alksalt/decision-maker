import { useState, useRef, useCallback, useMemo } from 'preact/hooks';
import { pickWinner, type Option } from '../spin';
import { resolvePhrase, type Persona } from '../personas';

export type Mode =
  | 'idle'
  | 'spinning'
  | 'revealed'
  | 'gutCheck'
  | 'testing'
  | 'testComplete'
  | 'outcome';

type Args = {
  options: Option[];
  persona: Persona;
  onWinner?: (w: Option) => void;
};

const SPIN_MS = 1600;
const TEST_INTERVAL_MS = 600;

export function useDecisionFlow({ options, persona, onWinner }: Args) {
  const [mode, setMode] = useState<Mode>('idle');
  const [winner, setWinner] = useState<Option | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [consensusWinner, setConsensusWinner] = useState<Option | null>(null);
  const [outcomeText, setOutcomeText] = useState<string>('');
  const runId = useRef(0);

  const validOptions = useMemo(
    () => options.filter(o => o.label.trim().length > 0),
    [options],
  );

  const canSpin =
    validOptions.length >= 2 &&
    (mode === 'idle' || mode === 'revealed' || mode === 'testComplete' || mode === 'gutCheck' || mode === 'outcome');

  const spin = useCallback(async () => {
    if (validOptions.length < 2) return;
    const myRun = ++runId.current;
    setMode('spinning');
    setWinner(null);
    await new Promise<void>(r => setTimeout(r, SPIN_MS));
    if (myRun !== runId.current) return;
    const w = pickWinner(validOptions);
    setWinner(w);
    setMode('revealed');
    onWinner?.(w);
    try { navigator.vibrate?.(40); } catch { /* unsupported */ }
  }, [validOptions, onWinner]);

  const enterGutCheck = useCallback(() => setMode('gutCheck'), []);

  const tellOutcome = useCallback((text: string) => {
    setOutcomeText(text);
    setMode('outcome');
  }, []);

  const runConsensus = useCallback(async () => {
    if (validOptions.length < 3) return;
    const myRun = ++runId.current;
    setMode('testing');
    setTestResults([]);
    setConsensusWinner(null);
    const results: string[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise<void>(r => setTimeout(r, TEST_INTERVAL_MS));
      if (myRun !== runId.current) return;
      const w = pickWinner(validOptions);
      results.push(w.label);
      setTestResults([...results]);
    }
    const counts = new Map<string, number>();
    for (const r of results) counts.set(r, (counts.get(r) ?? 0) + 1);
    let majorityLabel: string | null = null;
    for (const [lbl, c] of counts) if (c >= 3) majorityLabel = lbl;
    setConsensusWinner(
      majorityLabel ? validOptions.find(o => o.label === majorityLabel) ?? null : null,
    );
    setMode('testComplete');
    try { navigator.vibrate?.([30, 60, 30]); } catch { /* unsupported */ }
  }, [validOptions]);

  const reset = useCallback(() => {
    runId.current++;
    setMode('idle');
    setWinner(null);
    setTestResults([]);
    setConsensusWinner(null);
    setOutcomeText('');
  }, []);

  const ctxFor = (w: Option | null) => {
    if (!w) return { winner: '', other: '', others: '' };
    const others = validOptions.filter(o => o.id !== w.id);
    return {
      winner: w.label,
      other: others[0]?.label ?? '',
      others: others.map(o => o.label).join(', '),
    };
  };

  const say = (
    template: string,
    w: Option | null = winner,
    extra: { n?: number } = {},
  ) => resolvePhrase(template, { ...ctxFor(w), ...extra });

  return {
    mode, winner, testResults, consensusWinner, outcomeText,
    validOptions, canSpin,
    spin, enterGutCheck, tellOutcome, runConsensus, reset,
    say, persona,
  };
}
