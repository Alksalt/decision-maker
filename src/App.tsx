import { useState, useMemo } from 'preact/hooks';
import {
  createInitialState,
  addQuickOption,
  addTypedOption,
  updateOption,
  removeOption,
  setPersona,
} from './state';
import { PERSONAS, getPersona } from './personas';
import { useDecisionFlow } from './hooks/useDecisionFlow';
import { PersonaChip } from './components/PersonaChip';
import { Reel } from './components/Reel';
import { Doubt } from './components/Doubt';
import { TestStrip } from './components/TestStrip';
import { GutCheck } from './components/GutCheck';
import { Outcome } from './components/Outcome';
import { OptionsBlock } from './components/OptionsBlock';
import { Actions } from './components/Actions';

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function App() {
  const [appState, setAppState] = useState(createInitialState);
  const persona = getPersona(appState.personaId);
  const flow = useDecisionFlow({ options: appState.options, persona });

  const isSpinning = flow.mode === 'spinning';
  const winnerId = flow.winner?.id ?? null;

  const spinningPhrase = useMemo(
    () => pickRandom(persona.phrases.spinning),
    [persona.id, isSpinning],
  );

  const revealEyebrow = useMemo(
    () => (flow.winner ? flow.say(pickRandom(persona.phrases.reveal), flow.winner) : ''),
    [persona.id, winnerId],
  );

  const doubtText = useMemo(
    () => (flow.winner ? flow.say(pickRandom(persona.phrases.doubt), flow.winner) : ''),
    [persona.id, winnerId],
  );

  const revealRow = (() => {
    if (flow.mode === 'revealed') {
      return <Doubt eyebrow={revealEyebrow} doubt={doubtText} persona={persona} />;
    }
    if (flow.mode === 'testing' || flow.mode === 'testComplete') {
      let consensus: string | undefined;
      if (flow.mode === 'testComplete') {
        if (flow.consensusWinner) {
          const n = flow.testResults.filter(r => r === flow.consensusWinner!.label).length;
          consensus = flow.say(persona.phrases.consensusClear, flow.consensusWinner, { n });
        } else {
          consensus = flow.say(persona.phrases.consensusSplit, null);
        }
      }
      return <TestStrip results={flow.testResults} consensus={consensus} />;
    }
    if (flow.mode === 'gutCheck') {
      return (
        <GutCheck
          prompt={flow.say(persona.phrases.gutCheck, flow.winner)}
          onRelieved={() => flow.tellOutcome(flow.say(persona.phrases.relieved, flow.winner))}
          onBummed={() => flow.tellOutcome(flow.say(persona.phrases.disappointed, flow.winner))}
        />
      );
    }
    if (flow.mode === 'outcome') return <Outcome text={flow.outcomeText} />;
    return null;
  })();

  return (
    <div class="app">
      <div class="scanline-overlay" />
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div class="eyebrow">★ PICK &amp; DOUBT ★</div>
        <PersonaChip
          persona={persona}
          personas={PERSONAS}
          onChange={(id) => setAppState(s => setPersona(s, id))}
        />
      </header>

      <Reel
        mode={flow.mode}
        winner={flow.winner}
        options={appState.options}
        spinningPhrase={isSpinning ? spinningPhrase : undefined}
      />

      {revealRow}

      <OptionsBlock
        options={appState.options}
        disabled={flow.mode === 'spinning' || flow.mode === 'testing'}
        onAddQuick={() => setAppState(s => addQuickOption(s))}
        onAddTyped={() => setAppState(s => addTypedOption(s))}
        onUpdate={(id, label) => setAppState(s => updateOption(s, id, label))}
        onRemove={(id) => setAppState(s => removeOption(s, id))}
      />

      <Actions
        mode={flow.mode}
        canSpin={flow.canSpin}
        validCount={flow.validOptions.length}
        onSpin={flow.spin}
        onSpinAgain={flow.spin}
        onGutCheck={flow.enterGutCheck}
        onTest={flow.runConsensus}
        onReset={flow.reset}
      />
    </div>
  );
}
