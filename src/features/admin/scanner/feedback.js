let audioContext;

const TONES = {
  success: [[880, 0.09], [1320, 0.12]],
  warning: [[520, 0.16], [520, 0.16]],
  error: [[220, 0.3]],
};
const VIBRATION = { success: 80, warning: [60, 60, 60], error: 250 };

/** Short audible + haptic cue so volunteers do not have to look at the screen. */
export function signal(kind) {
  try {
    navigator.vibrate?.(VIBRATION[kind]);
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioContext ||= new Ctx();
    let t = audioContext.currentTime;
    TONES[kind].forEach(([freq, dur]) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur + 0.04;
    });
  } catch {
    // Audio/vibration are best-effort only.
  }
}
