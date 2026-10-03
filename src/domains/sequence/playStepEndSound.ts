let audioContext: AudioContext | undefined;

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

const beep = (context: AudioContext) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = 880;

  const now = context.currentTime;
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  oscillator.start(now);
  oscillator.stop(now + 0.2);
};

// A short synthesized beep — no audio asset to ship/license, and simple to swap out once
// sound customization (per vision.md) lands.
export const playStepEndSound = () => {
  const context = getAudioContext();

  if (context.state === "running") {
    beep(context);
  } else {
    // Still waiting on resume(): the context's clock is frozen, so schedule once it runs.
    context.resume().then(() => beep(context)).catch(() => {});
  }
};
