let audioContext: AudioContext | undefined;

type Note = {
  frequency: number;
  // Seconds from the start of the sound.
  start: number;
  duration: number;
  type: OscillatorType;
  gain: number;
};

// One sound per level, from the discreet single beep (1) to a loud triple-beep alarm (4).
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

// Browsers create an AudioContext "suspended" unless it's made (or resumed) during a user
// gesture — which a countdown ending on its own never is. Creating it early and resuming it
// on every call keeps the very first beep from being silent.
const getAudioContext = (): AudioContext => {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
};

// Call from a user gesture (or as soon as playback starts) so the first beep can sound.
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

// Synthesized beeps — no audio asset to ship/license. `level` is 1 (default, the most discreet)
// to SOUNDS.length.
export const playStepEndSound = (level = 1) => {
  const notes = SOUNDS[Math.min(Math.max(Math.round(level), 1), SOUNDS.length) - 1];
  const context = getAudioContext();

  const play = () => notes.forEach((note) => playNote(context, note));

  if (context.state === "running") {
    play();
  } else {
    // Still waiting on resume(): the context's clock is frozen, so schedule once it runs.
    context.resume().then(play).catch(() => {});
  }
};
