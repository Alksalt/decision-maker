export type Persona = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  phrases: {
    spinning: string[];
    reveal: string[];
    doubt: string[];
    gutCheck: string;
    relieved: string;
    disappointed: string;
    consensusIntro: string;
    consensusClear: string;
    consensusSplit: string;
  };
};

export const PERSONAS: Persona[] = [
  {
    id: 'overthinker',
    name: 'Anxious Overthinker',
    emoji: '\u{1F62C}',
    color: '#FF6B1F',
    phrases: {
      spinning: ['ok ok ok...', 'thinking...', "don't watch me", 'ugh fine'],
      reveal: ['{winner}. I guess?', 'It says {winner}.', '{winner}... maybe?'],
      doubt: [
        'but is {winner} really right today?',
        'what if {others} was better though?',
        "i don't know, {winner} feels... off?",
      ],
      gutCheck: 'Quick — relieved or disappointed?',
      relieved: 'Ok then trust it. Done. Stop worrying.',
      disappointed: 'See, you already knew. Go with {other}.',
      consensusIntro: "Let's just spin 5 times. To make sure. Please.",
      consensusClear: '{winner} won {n}/5. Stop spiralling. That is the answer.',
      consensusSplit: "It's truly random. Either is fine. Pick one and go.",
    },
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic Friend',
    emoji: '\u{1F643}',
    color: '#FFD700',
    phrases: {
      spinning: ['fine, hold on', 'consulting the gods of indecision', 'wow great question'],
      reveal: ['{winner}. Wild.', 'Oh look — {winner}.', "It's {winner}. Shocking."],
      doubt: [
        '{winner}. Really? On a day like today?',
        'are we sure about {winner} or just lazy?',
        '{winner} — bold choice. or boring. hard to tell.',
      ],
      gutCheck: 'So — relieved or disappointed? Be honest.',
      relieved: 'Cool. Glad we spent all that time on it.',
      disappointed: 'Yeah I could see it. Go {other}, drama queen.',
      consensusIntro: "Five spins. Because apparently one wasn't enough.",
      consensusClear: '{winner}: {n}/5. The universe has spoken. Loudly.',
      consensusSplit: "Truly tied. The universe doesn't care. Why should you?",
    },
  },
  {
    id: 'mystic',
    name: 'Mystic Oracle',
    emoji: '\u{1F52E}',
    color: '#B16CFF',
    phrases: {
      spinning: ['the veil parts...', 'the stars align...', 'ancient forces stir...'],
      reveal: ['The fates choose {winner}.', '{winner}, whispers the void.', 'I see... {winner}.'],
      doubt: [
        'Yet — is {winner} truly your path?',
        'The moon shadows {others}. Heed it.',
        '{winner} appears... but the omens are murky.',
      ],
      gutCheck: 'Speak — does your spirit lift or fall?',
      relieved: 'Then the path is true. Walk it.',
      disappointed: 'The veil has lifted. {other} is your true direction.',
      consensusIntro: 'Five castings of the bones. Let the pattern reveal itself.',
      consensusClear: '{winner} answered {n} times. The omens are clear.',
      consensusSplit: 'The fates are silent. Choose freely — none is wrong.',
    },
  },
  {
    id: 'zen',
    name: 'Zen Monk',
    emoji: '\u{1F9D8}',
    color: '#3AE0C9',
    phrases: {
      spinning: ['breathe...', 'the answer is already within...', 'still the mind...'],
      reveal: ['{winner}.', 'The answer: {winner}.', '{winner} arrives.'],
      doubt: [
        '{winner}. Notice — does your body soften or tense?',
        'Consider {others}. What does your breath say?',
        '{winner} is offered. Receive or release.',
      ],
      gutCheck: 'Observe — relieved, or quietly disappointed?',
      relieved: 'Then it is the right choice. Be at peace.',
      disappointed: 'Your truth was {other} all along. Walk that way.',
      consensusIntro: 'Five spins. Watch the pattern without grasping.',
      consensusClear: '{winner} appeared {n} times of five. The path is clear.',
      consensusSplit: 'No path is favored. Choose either, with full presence.',
    },
  },
];

export function getPersona(id: string): Persona {
  return PERSONAS.find(p => p.id === id) ?? PERSONAS[0];
}

export function resolvePhrase(
  template: string,
  ctx: { winner?: string; other?: string; others?: string; n?: number },
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = (ctx as Record<string, unknown>)[key];
    return value === undefined ? match : String(value);
  });
}
