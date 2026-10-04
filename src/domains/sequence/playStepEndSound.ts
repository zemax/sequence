let audioContext: AudioContext | undefined;

type Note = {
  frequency: number;
  start: number;
  duration: number;
  type: OscillatorType;
  gain: number;
};

const SOUNDS: Note[][] = [
  [{ frequency: 880, start: 0, duration: 0.2, type: "sine", gain: 0.2 }],
  [
    { frequency: 880, start: 0, duration: 0.18, type: "sine", gain: 0.35 },
    { frequency: 1175, start: 0.16, duration: 0.22, type: "sine", gain: 0.35 },
  ],
  [
    { frequency: 988, start: 0, duration: 0.14, type: "triangle", gain: 0.5 },
    { frequency: 988, start: 0.18, duration: 0.14, type: "triangle", gain: 0.5 },
    { frequency: 1319, start: 0.36, duration: 0.28, type: "triangle", gain: 0.5 },
  ],
  [
    { frequency: 1047, start: 0, duration: 0.16, type: "square", gain: 0.3 },
    { frequency: 1047, start: 0.2, duration: 0.16, type: "square", gain: 0.3 },
    { frequency: 1047, start: 0.4, duration: 0.16, type: "square", gain: 0.3 },
    { frequency: 1568, start: 0.6, duration: 0.35, type: "square", gain: 0.3 },
  ],
];

// Browsers keep a new AudioContext suspended unless it is created or resumed in a user gesture,
// which a countdown ending by itself is not: create it early and resume it before each sound.
const getAudioContext = (): AudioContext => {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
};

export const unlockStepEndSound = () => {
  getAudioContext();
};

const playNote = (context: AudioContext, note: Note) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.type = note.type;
  oscillator.frequency.value = note.frequency;

  const start = context.currentTime + note.start;
  const end = start + note.duration;
  gain.gain.setValueAtTime(note.gain, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.start(start);
  oscillator.stop(end);
};

export const playStepEndSound = (level = 1) => {
  const notes = SOUNDS[Math.min(Math.max(Math.round(level), 1), SOUNDS.length) - 1];
  const context = getAudioContext();

  const play = () => notes.forEach((note) => playNote(context, note));

  if (context.state === "running") {
    play();
  } else {
    // The context clock is frozen until resume() settles.
    context.resume().then(play).catch(() => {});
  }
};
