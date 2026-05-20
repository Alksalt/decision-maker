// theme-arcade.jsx — Direction A: Arcade Neon.
// Loud, playful slot-machine energy. Chunky display type, hot orange + yellow
// on near-black, vertical reel as the spin metaphor.

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const ARCADE = {
  bg: '#0B0712',
  card: '#1B1430',
  border: '#2D2347',
  text: '#FFE9C7',
  textMuted: '#A09BC0',
  primary: '#FF6B1F',
  hot: '#FF3D7F',
  yellow: '#FFD23F',
  green: '#3AE0C9',
  reelBg: '#0A0612',
};

function ArcadeApp() {
  const dm = window.useDM();
  const flow = window.useDecisionFlow();
  const { options, setOptions, persona } = dm;
  const { mode, validOptions, canSpin, spin, enterGutCheck, runConsensus, reset } = flow;

  const addQuick = () => {
    const used = new Set(options.map(o => o.label));
    const letter = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find(l => !used.has(l));
    if (!letter) return;
    setOptions([...options, { id: 'o' + Date.now() + Math.random(), label: letter }]);
  };
  const addTyped = () => setOptions([...options, { id: 'o' + Date.now() + Math.random(), label: '' }]);
  const updateOpt = (id, label) => setOptions(options.map(o => o.id === id ? { ...o, label } : o));
  const removeOpt = (id) => setOptions(options.filter(o => o.id !== id));

  return (
    <div style={{
      width: '100%', height: '100%',
      background: `radial-gradient(120% 60% at 50% 0%, #2A1850 0%, ${ARCADE.bg} 60%)`,
      color: ARCADE.text,
      fontFamily: '"Space Grotesk", -apple-system, system-ui, sans-serif',
      overflow: 'hidden', position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.05,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 3px, #fff 3px 4px)',
      }} />
      <div style={{ height: 56 }} />

      <div style={{ padding: '6px 20px 0', position: 'relative', zIndex: 2 }}>
        <div style={{
          fontFamily: '"Archivo Black", "Space Grotesk", sans-serif',
          fontSize: 10, letterSpacing: 4, color: ARCADE.yellow,
          textTransform: 'uppercase', marginBottom: 4, textAlign: 'center',
        }}>★ Pick &amp; Doubt ★</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ArcadePersonaChip />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, minHeight: 0 }}>
        <ArcadeReel mode={mode} winner={flow.winner} options={validOptions} persona={persona} flow={flow} />
      </div>

      <ArcadeOptionsBlock
        options={options}
        mode={mode}
        addQuick={addQuick}
        addTyped={addTyped}
        updateOpt={updateOpt}
        removeOpt={removeOpt}
      />

      <div style={{ padding: '10px 20px 30px', position: 'relative', zIndex: 2 }}>
        <ArcadeActions
          mode={mode} canSpin={canSpin} validCount={validOptions.length}
          spin={spin} enterGutCheck={enterGutCheck} runConsensus={runConsensus}
          reset={reset}
        />
      </div>
    </div>
  );
}

function ArcadePersonaChip() {
  const { persona, setPersonaId, personaId } = window.useDM();
  const [open, setOpen] = useStateA(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: ARCADE.card, border: `2px solid ${ARCADE.border}`,
          borderRadius: 999, padding: '5px 14px 5px 5px',
          color: ARCADE.text, cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          boxShadow: 'inset 0 1px 0 #ffffff10',
        }}>
        <span style={{
          width: 26, height: 26, borderRadius: 999,
          background: `radial-gradient(circle at 30% 25%, #ffffff30, transparent 60%), ${persona.color.arcade}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        }}>{persona.emoji}</span>
        <span>{persona.short}</span>
        <svg width="10" height="6" viewBox="0 0 10 6">
          <path d="M1 1l4 4 4-4" stroke={ARCADE.textMuted} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
          <div style={{
            position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', zIndex: 50,
            background: ARCADE.card, border: `2px solid ${ARCADE.border}`,
            borderRadius: 16, padding: 6, minWidth: 220,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}>
            {window.PERSONAS.map(p => (
              <button key={p.id}
                onClick={() => { setPersonaId(p.id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 10px',
                  background: p.id === personaId ? ARCADE.border : 'transparent',
                  border: 'none', borderRadius: 10,
                  color: ARCADE.text, fontFamily: 'inherit', fontSize: 14,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ArcadeReel({ mode, winner, options, persona, flow }) {
  const [phrase, setPhrase] = useStateA('');

  useEffectA(() => {
    if (mode === 'spinning' || mode === 'testing') {
      setPhrase(window.pickRandom(persona.phrases.spinning));
    }
  }, [mode, persona]);

  const cellH = 80;
  const labels = options.map(o => o.label).filter(Boolean);
  const stripLabels = (() => {
    if (labels.length === 0) return ['?', '?', '?'];
    const out = [];
    for (let i = 0; i < 12; i++) for (const l of labels) out.push(l);
    return out;
  })();

  const targetIdx = (() => {
    if (!winner) return Math.floor(stripLabels.length / 2);
    for (let i = stripLabels.length - 1; i >= stripLabels.length - labels.length * 2; i--) {
      if (stripLabels[i] === winner.label) return i;
    }
    return 0;
  })();

  // The reel shows 3 cells. Track is offset so target sits in the middle cell.
  const offset = mode === 'spinning' || mode === 'revealed'
    ? -(targetIdx - 1) * cellH
    : -Math.floor(stripLabels.length / 2) * cellH;

  const transition = mode === 'spinning'
    ? 'transform 1.6s cubic-bezier(.15,.6,.2,1)'
    : mode === 'revealed' ? 'none' : 'transform .3s ease';

  return (
    <div style={{ padding: '14px 20px 0', position: 'relative' }}>
      <div style={{
        background: ARCADE.reelBg,
        borderRadius: 22,
        border: `2px solid ${ARCADE.border}`,
        boxShadow: `inset 0 0 0 4px #1a1230, inset 0 0 30px rgba(255,109,31,0.15), 0 10px 30px rgba(0,0,0,0.5)`,
        height: cellH * 3, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: `linear-gradient(180deg, ${ARCADE.reelBg} 0%, transparent 20%, transparent 80%, ${ARCADE.reelBg} 100%)`,
        }} />
        <div style={{
          position: 'absolute', top: cellH, height: cellH, left: 0, right: 0,
          borderTop: `2px solid ${ARCADE.primary}66`, borderBottom: `2px solid ${ARCADE.primary}66`,
          boxShadow: `inset 0 0 30px ${ARCADE.primary}40`,
          pointerEvents: 'none', zIndex: 1,
        }} />
        <div style={{ transform: `translateY(${offset}px)`, transition }}>
          {stripLabels.map((label, i) => (
            <div key={i} style={{
              height: cellH,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Archivo Black", sans-serif',
              fontSize: label.length > 8 ? 22 : label.length > 5 ? 30 : 38,
              color: '#FFE066',
              textShadow: `0 0 16px ${ARCADE.primary}cc, 0 0 2px #fff`,
              letterSpacing: -1, textTransform: 'uppercase',
              padding: '0 16px', textAlign: 'center',
            }}>{label}</div>
          ))}
        </div>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: 8, height: 8, borderRadius: 999,
            background: '#3a2858', boxShadow: 'inset 0 0 0 2px #00000080',
            top: i < 2 ? 10 : 'auto', bottom: i >= 2 ? 10 : 'auto',
            left: i % 2 === 0 ? 10 : 'auto', right: i % 2 === 1 ? 10 : 'auto',
            zIndex: 3,
          }} />
        ))}
        {phrase && (mode === 'spinning' || mode === 'testing') && (
          <div style={{
            position: 'absolute', bottom: 8, left: 0, right: 0,
            textAlign: 'center', color: ARCADE.yellow, opacity: 0.7,
            fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', zIndex: 3,
          }}>{phrase}</div>
        )}
      </div>

      <div style={{ marginTop: 12, minHeight: 30 }}>
        {mode === 'revealed' && winner && <ArcadeDoubt persona={persona} flow={flow} />}
        {(mode === 'testing' || mode === 'testComplete') && <ArcadeTestStrip flow={flow} persona={persona} />}
        {mode === 'gutCheck' && <ArcadeGutCheck flow={flow} persona={persona} />}
        {mode === 'outcome' && <ArcadeOutcome flow={flow} />}
      </div>
    </div>
  );
}

function ArcadeDoubt({ persona, flow }) {
  const { winner, say } = flow;
  if (!winner) return null;
  const doubt = useStateA(() => say(window.pickRandom(persona.phrases.doubt), winner))[0];
  const prefix = useStateA(() => say(window.pickRandom(persona.phrases.reveal), winner))[0];
  return (
    <div style={{ animation: 'arcadePop .35s cubic-bezier(.2,1.4,.4,1) both' }}>
      <div style={{
        fontSize: 11, letterSpacing: 2, color: ARCADE.yellow,
        textTransform: 'uppercase', fontWeight: 700, textAlign: 'center',
      }}>{prefix}</div>
      <div style={{
        marginTop: 6, padding: '10px 14px',
        background: ARCADE.card, border: `2px solid ${ARCADE.border}`,
        borderRadius: 14, fontSize: 14, color: ARCADE.text, lineHeight: 1.4,
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20 }}>{persona.emoji}</span>
        <span>{doubt}</span>
      </div>
    </div>
  );
}

function ArcadeTestStrip({ flow, persona }) {
  const { testResults, mode, consensusWinner, say } = flow;
  return (
    <div>
      <div style={{
        fontSize: 10, letterSpacing: 2, color: ARCADE.hot,
        textTransform: 'uppercase', fontWeight: 700, textAlign: 'center', marginBottom: 6,
      }}>5-Spin test · {testResults.length}/5</div>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        {[0, 1, 2, 3, 4].map(i => {
          const r = testResults[i];
          return (
            <div key={i} style={{
              flex: 1, padding: '7px 4px',
              background: r ? ARCADE.card : '#0e0820',
              border: `2px solid ${r ? ARCADE.primary : ARCADE.border}`,
              borderRadius: 10, textAlign: 'center',
              fontFamily: '"Archivo Black", sans-serif',
              fontSize: r && r.length > 4 ? 9 : 12,
              color: r ? ARCADE.yellow : ARCADE.textMuted,
              minHeight: 30, lineHeight: 1.1,
              animation: r ? 'arcadePop .25s ease both' : 'none',
              textTransform: 'uppercase',
            }}>{r || '·'}</div>
          );
        })}
      </div>
      {mode === 'testComplete' && (
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: ARCADE.text, padding: '0 6px' }}>
          {consensusWinner
            ? say(persona.phrases.consensusClear, consensusWinner, { n: testResults.filter(r => r === consensusWinner.label).length })
            : persona.phrases.consensusSplit}
        </div>
      )}
    </div>
  );
}

function ArcadeGutCheck({ flow, persona }) {
  if (!flow.winner) return null;
  return (
    <div style={{ animation: 'arcadePop .3s ease both' }}>
      <div style={{
        textAlign: 'center', color: ARCADE.yellow, fontSize: 12, letterSpacing: 1.5,
        textTransform: 'uppercase', marginBottom: 8,
      }}>{persona.phrases.gutCheck}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <ArcadeBtn variant="ghost" onClick={() => flow.tellOutcome(flow.say(persona.phrases.relieved))}>Relieved 😌</ArcadeBtn>
        <ArcadeBtn variant="ghost" onClick={() => flow.tellOutcome(flow.say(persona.phrases.disappointed))}>Bummed 😩</ArcadeBtn>
      </div>
    </div>
  );
}

function ArcadeOutcome({ flow }) {
  return (
    <div style={{
      padding: '12px 14px', background: ARCADE.card,
      border: `2px solid ${ARCADE.primary}`, borderRadius: 14,
      textAlign: 'center', color: ARCADE.text, fontSize: 14, lineHeight: 1.4,
      animation: 'arcadePop .3s ease both',
    }}>{flow.outcomeText}</div>
  );
}

function ArcadeOptionsBlock({ options, mode, addQuick, addTyped, updateOpt, removeOpt }) {
  const collapsed = mode === 'spinning' || mode === 'testing';
  return (
    <div style={{
      padding: '10px 20px 0', position: 'relative', zIndex: 2,
      opacity: collapsed ? 0.35 : 1,
      pointerEvents: collapsed ? 'none' : 'auto',
      transition: 'opacity .25s',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: 2, color: ARCADE.textMuted,
          textTransform: 'uppercase', fontWeight: 700,
        }}>Options · {options.filter(o => o.label.trim()).length}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={addQuick} style={miniBtnStyle()}>+ A</button>
          <button onClick={addTyped} style={miniBtnStyle()}>+ Text</button>
        </div>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 124, overflowY: 'auto',
      }}>
        {options.length === 0 && (
          <div style={{
            padding: 12, border: `2px dashed ${ARCADE.border}`, borderRadius: 12,
            textAlign: 'center', color: ARCADE.textMuted, fontSize: 12,
          }}>add at least 2 options to spin →</div>
        )}
        {options.map((o, i) => (
          <div key={o.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: ARCADE.card, border: `2px solid ${ARCADE.border}`,
            borderRadius: 10, padding: '4px 4px 4px 12px', minHeight: 34,
          }}>
            <span style={{
              fontFamily: '"Archivo Black", sans-serif', fontSize: 10,
              color: ARCADE.textMuted, minWidth: 16,
            }}>{(i + 1).toString().padStart(2, '0')}</span>
            <input
              value={o.label}
              onChange={e => updateOpt(o.id, e.target.value)}
              placeholder="type…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: ARCADE.text, fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
              }}/>
            <button onClick={() => removeOpt(o.id)} style={{
              width: 26, height: 26, border: 'none', background: 'transparent',
              color: ARCADE.textMuted, fontSize: 16, cursor: 'pointer', borderRadius: 6,
            }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function miniBtnStyle() {
  return {
    padding: '4px 10px', background: 'transparent',
    border: `1.5px solid ${ARCADE.border}`, borderRadius: 999,
    color: ARCADE.yellow, fontFamily: 'inherit', fontSize: 10,
    fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
    cursor: 'pointer',
  };
}

function ArcadeActions({ mode, canSpin, validCount, spin, enterGutCheck, runConsensus, reset }) {
  if (mode === 'idle' || mode === 'spinning') {
    return (
      <button
        disabled={!canSpin}
        onClick={() => spin()}
        style={{
          width: '100%', padding: '16px 0',
          background: canSpin ? `linear-gradient(180deg, #FF8C4A 0%, ${ARCADE.primary} 100%)` : '#2a2040',
          border: 'none', borderRadius: 18,
          color: canSpin ? '#fff' : ARCADE.textMuted,
          fontFamily: '"Archivo Black", sans-serif',
          fontSize: 26, letterSpacing: 6,
          cursor: canSpin ? 'pointer' : 'not-allowed',
          boxShadow: canSpin
            ? `0 5px 0 #B73C00, 0 18px 40px ${ARCADE.primary}50, inset 0 2px 0 #ffffff60`
            : 'none',
          transform: mode === 'spinning' ? 'translateY(4px)' : 'translateY(0)',
          transition: 'transform .15s',
        }}>{mode === 'spinning' ? 'SPINNING…' : 'SPIN'}</button>
    );
  }
  if (mode === 'revealed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <ArcadeBtn onClick={() => spin()} variant="primary">Spin again</ArcadeBtn>
        <div style={{ display: 'flex', gap: 7 }}>
          {validCount === 2 && <ArcadeBtn onClick={enterGutCheck} variant="ghost">Gut-check</ArcadeBtn>}
          {validCount >= 3 && <ArcadeBtn onClick={runConsensus} variant="ghost">5-spin test</ArcadeBtn>}
          <ArcadeBtn onClick={reset} variant="dim">Done</ArcadeBtn>
        </div>
      </div>
    );
  }
  if (mode === 'testing') {
    return (
      <div style={{ textAlign: 'center', color: ARCADE.textMuted, fontSize: 12, padding: '8px 0', letterSpacing: 2, textTransform: 'uppercase' }}>
        rolling the dice 5×…
      </div>
    );
  }
  if (mode === 'testComplete' || mode === 'outcome' || mode === 'gutCheck') {
    return (
      <div style={{ display: 'flex', gap: 7 }}>
        <ArcadeBtn onClick={() => { reset(); setTimeout(() => spin(), 50); }} variant="primary">Spin again</ArcadeBtn>
        <ArcadeBtn onClick={reset} variant="ghost">Reset</ArcadeBtn>
      </div>
    );
  }
  return null;
}

function ArcadeBtn({ children, onClick, variant }) {
  const base = {
    flex: 1, padding: '12px 0',
    fontFamily: '"Space Grotesk", sans-serif',
    fontWeight: 700, fontSize: 13, letterSpacing: 1,
    border: 'none', borderRadius: 12, cursor: 'pointer',
    textTransform: 'uppercase',
  };
  if (variant === 'primary') return (
    <button onClick={onClick} style={{
      ...base, background: ARCADE.primary, color: '#fff',
      boxShadow: `0 4px 0 #B73C00, inset 0 1px 0 #ffffff40`,
    }}>{children}</button>
  );
  if (variant === 'dim') return (
    <button onClick={onClick} style={{
      ...base, background: 'transparent', color: ARCADE.textMuted,
      border: `2px solid ${ARCADE.border}`,
    }}>{children}</button>
  );
  return (
    <button onClick={onClick} style={{
      ...base, background: ARCADE.card, color: ARCADE.yellow,
      border: `2px solid ${ARCADE.border}`,
    }}>{children}</button>
  );
}

Object.assign(window, { ArcadeApp });
