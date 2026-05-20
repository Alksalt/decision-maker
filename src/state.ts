import type { Option } from './spin';

export type Mode =
  | 'idle'
  | 'spinning'
  | 'revealed'
  | 'gutCheck'
  | 'testing'
  | 'testComplete'
  | 'outcome';

export type AppState = {
  personaId: string;
  options: Option[];
  mode: Mode;
  winner: Option | null;
  testResults: string[];
  outcomeText: string | null;
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let idCounter = 0;
const nextId = (): string => `o${++idCounter}`;

export function createInitialState(): AppState {
  return {
    personaId: 'overthinker',
    options: [],
    mode: 'idle',
    winner: null,
    testResults: [],
    outcomeText: null,
  };
}

export function addQuickOption(state: AppState): AppState {
  const used = new Set(state.options.map(o => o.label));
  const letter = [...LETTERS].find(l => !used.has(l));
  if (!letter) return state;
  return { ...state, options: [...state.options, { id: nextId(), label: letter }] };
}

export function addTypedOption(state: AppState): AppState {
  return { ...state, options: [...state.options, { id: nextId(), label: '' }] };
}

export function updateOption(state: AppState, id: string, label: string): AppState {
  return {
    ...state,
    options: state.options.map(o => (o.id === id ? { ...o, label } : o)),
  };
}

export function removeOption(state: AppState, id: string): AppState {
  return { ...state, options: state.options.filter(o => o.id !== id) };
}

export function setPersona(state: AppState, personaId: string): AppState {
  return { ...state, personaId };
}

export function startSpin(state: AppState): AppState {
  return { ...state, mode: 'spinning', winner: null, testResults: [] };
}

export function revealWinner(state: AppState, winner: Option): AppState {
  return { ...state, mode: 'revealed', winner };
}

export function enterGutCheck(state: AppState): AppState {
  return { ...state, mode: 'gutCheck' };
}

export function startConsensus(state: AppState): AppState {
  return { ...state, mode: 'testing', winner: null, testResults: [] };
}

export function appendConsensusResult(state: AppState, label: string): AppState {
  return { ...state, testResults: [...state.testResults, label] };
}

export function finalizeConsensus(state: AppState, winner: Option | null): AppState {
  return { ...state, mode: 'testComplete', winner };
}

export function setOutcome(state: AppState, text: string): AppState {
  return { ...state, mode: 'outcome', outcomeText: text };
}

export function reset(state: AppState): AppState {
  return { ...state, mode: 'idle', winner: null, testResults: [], outcomeText: null };
}

export function nonEmptyOptions(state: AppState): Option[] {
  return state.options.filter(o => o.label.trim().length > 0);
}
