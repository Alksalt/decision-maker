// personas.jsx — persona data + phrase resolver
// Lifted from the source repo and lightly expanded with per-theme accents.

const PERSONAS = [
  {
    id: 'overthinker',
    name: 'Anxious Overthinker',
    short: 'Overthinker',
    emoji: '😬',
    tagline: 'second-guesses everything',
    color: { arcade: '#FF6B1F', mystic: '#D4A754', paper: '#C97359' },
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
    short: 'Sarcastic',
    emoji: '🙃',
    tagline: 'dry, teasing, unhelpful',
    color: { arcade: '#FFD700', mystic: '#B8B5D6', paper: '#88A096' },
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
    short: 'Oracle',
    emoji: '🔮',
    tagline: 'cryptic and dramatic',
    color: { arcade: '#B16CFF', mystic: '#E8D9A8', paper: '#6F5B8E' },
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
    short: 'Zen',
    emoji: '🧘',
    tagline: 'calm, mindful, patient',
    color: { arcade: '#3AE0C9', mystic: '#9FD8C7', paper: '#7A8C6A' },
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

function getPersona(id) {
  return PERSONAS.find(p => p.id === id) || PERSONAS[0];
}

function resolvePhrase(template, ctx) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (m, k) => (ctx[k] === undefined ? m : String(ctx[k])));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Sample option presets surfaced via the Tweaks panel
const PRESETS = {
  custom: { name: 'Custom', options: [] },
  food: { name: '🍜 What to eat', options: ['Ramen', 'Tacos', 'Sushi', 'Pizza', 'Salad'] },
  movie: { name: '🎬 Tonight\u2019s film', options: ['Thriller', 'Comedy', 'Documentary', 'Anime'] },
  yesno: { name: '🤔 Should I…', options: ['Yes', 'No'] },
  weekend: { name: '🌤 This weekend', options: ['Hike', 'Read at café', 'Stay in', 'Friends'] },
};

Object.assign(window, { PERSONAS, getPersona, resolvePhrase, pickRandom, PRESETS });
