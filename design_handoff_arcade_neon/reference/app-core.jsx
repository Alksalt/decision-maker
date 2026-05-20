// app-core.jsx — shared hooks each theme uses to power the decision flow.
// Themes own their own visuals; logic lives here so the four personas,
// presets, and the spin / gut-check / 5-spin states behave identically
// across Arcade, Mystic and Paper.

const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

const DMContext = createContext(null);

function DMProvider({ children, initialPersona = 'overthinker', initialPreset = 'food' }) {
  const [personaId, setPersonaId] = useState(initialPersona);
  const [presetId, setPresetId] = useState(initialPreset);
  const [motion, setMotion] = useState('normal'); // 'subtle' | 'normal' | 'cinematic'
  const [options, setOptions] = useState(() =>
    (window.PRESETS[initialPreset]?.options || []).map((label, i) => ({ id: `o${i}`, label }))
  );

  // When preset changes, replace options (unless 'custom' — preserve)
  useEffect(() => {
    if (presetId === 'custom') return;
    const src = window.PRESETS[presetId]?.options || [];
    setOptions(src.map((label, i) => ({ id: `p${presetId}-${i}-${Date.now()}`, label })));
  }, [presetId]);

  const persona = window.getPersona(personaId);

  const value = {
    personaId, setPersonaId,
    presetId, setPresetId,
    motion, setMotion,
    options, setOptions,
    persona,
  };
  return <DMContext.Provider value={value}>{children}</DMContext.Provider>;
}

function useDM() {
  return useContext(DMContext);
}

// Per-theme decision flow. Returns mode + winner + actions.
function useDecisionFlow({ onWinner } = {}) {
  const { options, persona } = useDM();
  const [mode, setMode] = useState('idle');
  const [winner, setWinner] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [consensusWinner, setConsensusWinner] = useState(null);
  const runId = useRef(0);

  const validOptions = useMemo(
    () => options.filter(o => o.label.trim().length > 0),
    [options]
  );

  const canSpin = validOptions.length >= 2 && (mode === 'idle' || mode === 'revealed' || mode === 'testComplete' || mode === 'gutCheck');

  const spin = useCallback(async (animateMs = 1800) => {
    if (validOptions.length < 2) return;
    const myRun = ++runId.current;
    setMode('spinning');
    setWinner(null);
    await new Promise(r => setTimeout(r, animateMs));
    if (myRun !== runId.current) return;
    const w = validOptions[Math.floor(Math.random() * validOptions.length)];
    setWinner(w);
    setMode('revealed');
    if (onWinner) onWinner(w);
    if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {}
  }, [validOptions, onWinner]);

  const enterGutCheck = useCallback(() => setMode('gutCheck'), []);
  const finishGutCheck = useCallback(() => setMode('outcome'), []);
  const [outcomeText, setOutcomeText] = useState('');
  const tellOutcome = (txt) => { setOutcomeText(txt); setMode('outcome'); };

  const runConsensus = useCallback(async () => {
    if (validOptions.length < 3) return;
    const myRun = ++runId.current;
    setMode('testing');
    setTestResults([]);
    setConsensusWinner(null);
    const results = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 600));
      if (myRun !== runId.current) return;
      const w = validOptions[Math.floor(Math.random() * validOptions.length)];
      results.push(w.label);
      setTestResults([...results]);
    }
    const counts = new Map();
    for (const r of results) counts.set(r, (counts.get(r) || 0) + 1);
    let majorityLabel = null;
    for (const [lbl, c] of counts) if (c >= 3) majorityLabel = lbl;
    setConsensusWinner(majorityLabel ? validOptions.find(o => o.label === majorityLabel) : null);
    setMode('testComplete');
    if (navigator.vibrate) try { navigator.vibrate([30, 60, 30]); } catch (e) {}
  }, [validOptions]);

  const reset = useCallback(() => {
    runId.current++;
    setMode('idle');
    setWinner(null);
    setTestResults([]);
    setConsensusWinner(null);
    setOutcomeText('');
  }, []);

  // Phrase helpers
  const ctxFor = (w) => {
    if (!w) return { winner: '', other: '', others: '' };
    const others = validOptions.filter(o => o.id !== w.id);
    return {
      winner: w.label,
      other: others[0]?.label ?? '',
      others: others.map(o => o.label).join(', '),
    };
  };
  const say = (template, w = winner, extra = {}) =>
    window.resolvePhrase(template, { ...ctxFor(w), ...extra });

  return {
    mode, winner, testResults, consensusWinner, outcomeText,
    validOptions, canSpin,
    spin, enterGutCheck, finishGutCheck, tellOutcome, runConsensus, reset,
    say,
  };
}

Object.assign(window, { DMProvider, useDM, useDecisionFlow, DMContext });
