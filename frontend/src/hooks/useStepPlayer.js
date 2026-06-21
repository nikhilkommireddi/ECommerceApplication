import { useEffect, useRef, useState, useCallback } from "react";

// Drives animation over an array of frames: play/pause/step/scrub/speed.
// `frames` is rebuilt by each visualizer from its input; when it changes we
// reset to frame 0.
export function useStepPlayer(frames, { autoplay = false } = {}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState(1);
  const timer = useRef(null);
  const n = frames.length;

  // reset when the frame set changes (new input / new algorithm)
  useEffect(() => {
    setIndex(0);
    setPlaying(autoplay);
  }, [frames]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    clearTimeout(timer.current);
    if (!playing || n === 0) return;
    if (index >= n - 1) {
      setPlaying(false);
      return;
    }
    const delay = Math.max(16, 420 / speed);
    timer.current = setTimeout(() => setIndex((i) => Math.min(n - 1, i + 1)), delay);
    return () => clearTimeout(timer.current);
  }, [playing, index, speed, n]);

  const play = useCallback(() => {
    if (index >= n - 1) setIndex(0);
    setPlaying(true);
  }, [index, n]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const stepF = useCallback(() => { setPlaying(false); setIndex((i) => Math.min(n - 1, i + 1)); }, [n]);
  const stepB = useCallback(() => { setPlaying(false); setIndex((i) => Math.max(0, i - 1)); }, []);
  const reset = useCallback(() => { setPlaying(false); setIndex(0); }, []);

  return {
    index, setIndex, playing, speed, setSpeed,
    play, pause, toggle, stepF, stepB, reset,
    atEnd: index >= n - 1, total: n,
    frame: n ? frames[Math.min(index, n - 1)] : null,
  };
}
