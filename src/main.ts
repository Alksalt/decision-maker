import './style.css';
import { getPersona, PERSONAS, resolvePhrase } from './personas';
import { pickWinner, runConsensus, type Option } from './spin';
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

const TEST_ROUNDS = 5;
let state: AppState = createInitialState();
let consensusRunId = 0;

const els = {
  chip: $<HTMLButtonElement>('persona-chip'),
  list: $<HTMLUListElement>('options-list'),
  addQuick: $<HTMLButtonElement>('add-quick'),
  addTyped: $<HTMLButtonElement>('add-typed'),
  spinBtn: $<HTMLButtonElement>('spin-btn'),
  reveal: $<HTMLDivElement>('reveal'),
  revealPrefix: $<HTMLDivElement>('reveal-prefix'),
  revealWinner: $<HTMLDivElement>('reveal-winner'),
  revealDoubt: $<HTMLDivElement>('reveal-doubt'),
  actionRespin: $<HTMLButtonElement>('action-respin'),
  actionTest: $<HTMLButtonElement>('action-test'),
  actionDone: $<HTMLButtonElement>('action-done'),
  gutCheck: $<HTMLDivElement>('gut-check'),
  testStage: $<HTMLDivElement>('test-stage'),
  sheet: $<HTMLDialogElement>('persona-sheet'),
  spinStatus: $<HTMLDivElement>('spin-status'),
};

function setState(next: AppState): void {
  state = next;
  render();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function otherOptions(winnerId: string): Option[] {
  return nonEmptyOptions(state).filter(o => o.id !== winnerId);
}

function othersOf(winnerId: string): string {
  return otherOptions(winnerId).map(o => o.label).join(', ');
}

function otherOf(winnerId: string): string {
  return otherOptions(winnerId)[0]?.label ?? '';
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

function tryTriggerSpin(): void {
  if (!els.spinBtn.disabled) void doSpin();
}

function renderOptions(): void {
  els.list.replaceChildren();
  for (const opt of state.options) {
    const li = document.createElement('li');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = opt.label;
    input.placeholder = 'type an option';
    input.autocapitalize = 'sentences';
    input.setAttribute('enterkeyhint', 'done');
    input.addEventListener('input', () => setState(updateOption(state, opt.id, input.value)));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
        tryTriggerSpin();
      }
    });
    const remove = makeButton('remove', '×', () => setState(removeOption(state, opt.id)));
    remove.setAttribute('aria-label', `Remove ${opt.label || 'option'}`);
    li.appendChild(input);
    li.appendChild(remove);
    els.list.appendChild(li);
  }
  const interactiveMode =
    state.mode === 'idle' ||
    state.mode === 'revealed' ||
    state.mode === 'testComplete' ||
    state.mode === 'gutCheck';
  els.list.setAttribute('aria-disabled', interactiveMode ? 'false' : 'true');
  els.addQuick.disabled = !interactiveMode;
  els.addTyped.disabled = !interactiveMode;
  els.spinBtn.disabled =
    state.mode === 'spinning' || state.mode === 'testing' || nonEmptyOptions(state).length < 2;
}

function showOnly(mode: Mode): void {
  els.reveal.classList.toggle('hidden', mode !== 'revealed');
  els.gutCheck.classList.toggle('hidden', mode !== 'gutCheck');
  els.testStage.classList.toggle('hidden', mode !== 'testing' && mode !== 'testComplete');
  if (mode === 'idle') hideReel();
}

function renderSpinStatus(): void {
  if (state.mode === 'spinning') {
    if (!els.spinStatus.textContent) {
      const p = getPersona(state.personaId);
      els.spinStatus.textContent = pick(p.phrases.spinning);
    }
  } else {
    els.spinStatus.textContent = '';
  }
}

function renderReveal(): void {
  if (!state.winner) return;
  const p = getPersona(state.personaId);
  const ctx = {
    winner: state.winner.label,
    other: otherOf(state.winner.id),
    others: othersOf(state.winner.id),
  };
  els.revealPrefix.textContent = resolvePhrase(pick(p.phrases.reveal), ctx);
  els.revealWinner.textContent = state.winner.label;
  els.revealDoubt.textContent = resolvePhrase(pick(p.phrases.doubt), ctx);
  const opts = nonEmptyOptions(state);
  if (opts.length === 2) {
    els.actionTest.textContent = 'Gut-check';
    els.actionTest.classList.remove('hidden');
  } else if (opts.length >= 3) {
    els.actionTest.textContent = `Run ${TEST_ROUNDS}-spin test`;
    els.actionTest.classList.remove('hidden');
  } else {
    els.actionTest.classList.add('hidden');
  }
}

function renderGutCheck(): void {
  const p = getPersona(state.personaId);
  const winner = state.winner;
  els.gutCheck.replaceChildren();
  const prompt = document.createElement('div');
  prompt.className = 'reveal-doubt';
  prompt.textContent = p.phrases.gutCheck;
  const row = document.createElement('div');
  row.className = 'reveal-actions';
  row.appendChild(
    makeButton('btn-secondary', 'Relieved', () => {
      showOutcome(resolvePhrase(p.phrases.relieved, { winner: winner?.label ?? '' }));
    }),
  );
  row.appendChild(
    makeButton('btn-secondary', 'Disappointed', () => {
      showOutcome(
        resolvePhrase(p.phrases.disappointed, {
          winner: winner?.label ?? '',
          other: otherOf(winner?.id ?? ''),
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
  if (state.mode === 'testing') {
    const progress = document.createElement('div');
    progress.className = 'test-progress';
    progress.textContent = `Spin ${state.testResults.length} of ${TEST_ROUNDS}`;
    els.testStage.appendChild(progress);
  }
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
        winner: winner.label,
        n: counts.get(winner.label) ?? 0,
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
  renderSpinStatus();
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
  if (state.mode !== 'spinning') return;
  setState(revealWinner(state, winner));
}

async function doConsensus(): Promise<void> {
  const runId = ++consensusRunId;
  const opts = nonEmptyOptions(state);
  setState(startConsensus(state));
  const { results, winner } = runConsensus(opts, TEST_ROUNDS);
  for (const label of results) {
    await new Promise(r => setTimeout(r, 400));
    if (runId !== consensusRunId || state.mode !== 'testing') return;
    setState(appendConsensusResult(state, label));
  }
  if (runId !== consensusRunId || state.mode !== 'testing') return;
  const winnerOption = winner ? opts.find(o => o.label === winner) ?? null : null;
  setState(finalizeConsensus(state, winnerOption));
}

function openPersonaSheet(): void {
  els.sheet.replaceChildren();
  const heading = document.createElement('h2');
  heading.id = 'persona-sheet-title';
  heading.className = 'persona-sheet-title';
  heading.textContent = 'Choose persona';
  els.sheet.appendChild(heading);
  const buttons: HTMLButtonElement[] = [];
  for (const p of PERSONAS) {
    const btn = document.createElement('button');
    btn.className = 'persona-option';
    if (p.id === state.personaId) btn.setAttribute('aria-current', 'true');
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
    buttons.push(btn);
  }
  els.sheet.showModal();
  const focusTarget = buttons.find(b => b.getAttribute('aria-current') === 'true') ?? buttons[0];
  focusTarget?.focus();
}

function wire(): void {
  els.chip.addEventListener('click', openPersonaSheet);
  els.addQuick.addEventListener('click', () => setState(addQuickOption(state)));
  els.addTyped.addEventListener('click', () => setState(addTypedOption(state)));
  els.spinBtn.addEventListener('click', () => void doSpin());
  els.actionRespin.addEventListener('click', () => void doSpin());
  els.actionTest.addEventListener('click', () => {
    const opts = nonEmptyOptions(state);
    if (opts.length === 2) {
      setState(enterGutCheck(state));
    } else if (opts.length >= 3) {
      void doConsensus();
    }
  });
  els.actionDone.addEventListener('click', () => {
    consensusRunId++;
    setState(reset(state));
  });
  els.sheet.addEventListener('click', e => {
    if (e.target === els.sheet) els.sheet.close();
  });
}

wire();
render();
