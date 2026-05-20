import './style.css';
import { getPersona, PERSONAS, resolvePhrase } from './personas';
import { pickWinner, runConsensus } from './spin';
import { animateReel, hideReel } from './reel';
import {
  type AppState,
  type Mode,
  createInitialState,
  addQuickOption,
  addTypedOption,
  updateOption,
  removeOption,
  setPersona,
  startSpin,
  revealWinner,
  enterGutCheck,
  startConsensus,
  appendConsensusResult,
  finalizeConsensus,
  reset,
  nonEmptyOptions,
} from './state';

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
};

let state: AppState = createInitialState();

const els = {
  chip: $<HTMLButtonElement>('persona-chip'),
  list: $<HTMLUListElement>('options-list'),
  addQuick: $<HTMLButtonElement>('add-quick'),
  addTyped: $<HTMLButtonElement>('add-typed'),
  spinBtn: $<HTMLButtonElement>('spin-btn'),
  reveal: $<HTMLDivElement>('reveal'),
  revealWinner: $<HTMLDivElement>('reveal-winner'),
  revealDoubt: $<HTMLDivElement>('reveal-doubt'),
  actionRespin: $<HTMLButtonElement>('action-respin'),
  actionTest: $<HTMLButtonElement>('action-test'),
  actionDone: $<HTMLButtonElement>('action-done'),
  gutCheck: $<HTMLDivElement>('gut-check'),
  testStage: $<HTMLDivElement>('test-stage'),
  sheet: $<HTMLDialogElement>('persona-sheet'),
};

function setState(next: AppState): void {
  state = next;
  render();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function othersOf(winner: string): string {
  return nonEmptyOptions(state)
    .map(o => o.label)
    .filter(l => l !== winner)
    .join(', ');
}

function otherOf(winner: string): string {
  const others = nonEmptyOptions(state).filter(o => o.label !== winner);
  return others[0]?.label ?? '';
}

function makeButton(className: string, text: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = className;
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  return btn;
}

function renderPersonaChip(): void {
  const p = getPersona(state.personaId);
  els.chip.textContent = `${p.emoji} ${p.name}`;
}

function renderOptions(): void {
  els.list.replaceChildren();
  for (const opt of state.options) {
    const li = document.createElement('li');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = opt.label;
    input.placeholder = 'type an option';
    input.addEventListener('input', () => setState(updateOption(state, opt.id, input.value)));
    const remove = makeButton('remove', '×', () => setState(removeOption(state, opt.id)));
    remove.setAttribute('aria-label', 'Remove option');
    li.appendChild(input);
    li.appendChild(remove);
    els.list.appendChild(li);
  }
  els.spinBtn.disabled = nonEmptyOptions(state).length < 2;
}

function showOnly(mode: Mode): void {
  els.reveal.classList.toggle('hidden', mode !== 'revealed');
  els.gutCheck.classList.toggle('hidden', mode !== 'gutCheck');
  els.testStage.classList.toggle('hidden', mode !== 'testing' && mode !== 'testComplete');
  if (mode === 'idle') hideReel();
}

function renderReveal(): void {
  if (!state.winner) return;
  const p = getPersona(state.personaId);
  els.revealWinner.textContent = state.winner;
  els.revealDoubt.textContent = resolvePhrase(pick(p.phrases.doubt), {
    winner: state.winner,
    other: otherOf(state.winner),
    others: othersOf(state.winner),
  });
  const opts = nonEmptyOptions(state);
  if (opts.length === 2) {
    els.actionTest.textContent = 'Gut-check';
    els.actionTest.classList.remove('hidden');
  } else if (opts.length >= 3) {
    els.actionTest.textContent = 'Run 5-spin test';
    els.actionTest.classList.remove('hidden');
  } else {
    els.actionTest.classList.add('hidden');
  }
}

function renderGutCheck(): void {
  const p = getPersona(state.personaId);
  els.gutCheck.replaceChildren();
  const prompt = document.createElement('div');
  prompt.className = 'reveal-doubt';
  prompt.textContent = p.phrases.gutCheck;
  const row = document.createElement('div');
  row.className = 'reveal-actions';
  row.appendChild(
    makeButton('btn-secondary', 'Relieved', () => {
      showOutcome(resolvePhrase(p.phrases.relieved, { winner: state.winner ?? '' }));
    }),
  );
  row.appendChild(
    makeButton('btn-secondary', 'Disappointed', () => {
      showOutcome(
        resolvePhrase(p.phrases.disappointed, {
          winner: state.winner ?? '',
          other: otherOf(state.winner ?? ''),
        }),
      );
    }),
  );
  els.gutCheck.appendChild(prompt);
  els.gutCheck.appendChild(row);
}

function showOutcome(message: string): void {
  els.gutCheck.replaceChildren();
  const text = document.createElement('div');
  text.className = 'reveal-doubt';
  text.textContent = message;
  els.gutCheck.appendChild(text);
  els.gutCheck.appendChild(makeButton('btn-secondary', 'Done', () => setState(reset(state))));
}

function renderTest(): void {
  const p = getPersona(state.personaId);
  els.testStage.replaceChildren();
  const intro = document.createElement('div');
  intro.className = 'reveal-doubt';
  intro.textContent = p.phrases.consensusIntro;
  els.testStage.appendChild(intro);
  for (const label of state.testResults) {
    const row = document.createElement('div');
    row.className = 'test-row';
    row.textContent = label;
    els.testStage.appendChild(row);
  }
  if (state.mode === 'testComplete') {
    const summary = document.createElement('div');
    summary.className = 'reveal-doubt';
    const winner = state.winner;
    const counts = new Map<string, number>();
    for (const r of state.testResults) counts.set(r, (counts.get(r) ?? 0) + 1);
    if (winner) {
      summary.textContent = resolvePhrase(p.phrases.consensusClear, {
        winner,
        n: counts.get(winner) ?? 0,
      });
    } else {
      summary.textContent = p.phrases.consensusSplit;
    }
    els.testStage.appendChild(summary);
    els.testStage.appendChild(makeButton('btn-secondary', 'Done', () => setState(reset(state))));
  }
}

function render(): void {
  renderPersonaChip();
  renderOptions();
  showOnly(state.mode);
  if (state.mode === 'revealed') renderReveal();
  if (state.mode === 'gutCheck') renderGutCheck();
  if (state.mode === 'testing' || state.mode === 'testComplete') renderTest();
}

async function doSpin(): Promise<void> {
  const opts = nonEmptyOptions(state);
  if (opts.length < 2) return;
  setState(startSpin(state));
  const winner = pickWinner(opts);
  await animateReel(winner.label, opts.map(o => o.label));
  hideReel();
  setState(revealWinner(state, winner.label));
}

async function doConsensus(): Promise<void> {
  const opts = nonEmptyOptions(state);
  setState(startConsensus(state));
  const { results, winner } = runConsensus(opts, 5);
  for (const label of results) {
    setState(appendConsensusResult(state, label));
    await new Promise(r => setTimeout(r, 400));
  }
  setState(finalizeConsensus(state, winner));
}

function openPersonaSheet(): void {
  els.sheet.replaceChildren();
  for (const p of PERSONAS) {
    const btn = document.createElement('button');
    btn.className = 'persona-option';
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = p.emoji;
    const name = document.createElement('span');
    name.textContent = p.name;
    btn.appendChild(emoji);
    btn.appendChild(name);
    btn.addEventListener('click', () => {
      setState(setPersona(state, p.id));
      els.sheet.close();
    });
    els.sheet.appendChild(btn);
  }
  els.sheet.showModal();
}

function wire(): void {
  els.chip.addEventListener('click', openPersonaSheet);
  els.addQuick.addEventListener('click', () => setState(addQuickOption(state)));
  els.addTyped.addEventListener('click', () => setState(addTypedOption(state)));
  els.spinBtn.addEventListener('click', doSpin);
  els.actionRespin.addEventListener('click', doSpin);
  els.actionTest.addEventListener('click', () => {
    const opts = nonEmptyOptions(state);
    if (opts.length === 2) {
      setState(enterGutCheck(state));
    } else if (opts.length >= 3) {
      void doConsensus();
    }
  });
  els.actionDone.addEventListener('click', () => setState(reset(state)));
  els.sheet.addEventListener('click', e => {
    if (e.target === els.sheet) els.sheet.close();
  });
}

wire();
render();
