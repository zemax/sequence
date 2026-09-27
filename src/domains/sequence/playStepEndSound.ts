let audioContext: AudioContext | undefined;

// A short synthesized beep — no audio asset to ship/license, and simple to swap out once
// sound customization (per vision.md) lands.
export const playStepEndSound = () => {
  audioContext ??= new AudioContext();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = 880;

  const now = audioContext.currentTime;
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  oscillator.start(now);
  oscillator.stop(now + 0.2);
};
