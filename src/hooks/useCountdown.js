import { useEffect, useState } from 'react';

const split = ms => ({
  days: Math.floor(ms / 86400000),
  hours: Math.floor((ms / 3600000) % 24),
  minutes: Math.floor((ms / 60000) % 60),
  seconds: Math.floor((ms / 1000) % 60),
});

/** Time left until `target` (ISO string); returns null once it has passed. */
export function useCountdown(target) {
  const targetMs = new Date(target).getTime();
  const [left, setLeft] = useState(() => targetMs - Date.now());

  useEffect(() => {
    if (Number.isNaN(targetMs)) return undefined;
    const id = setInterval(() => setLeft(targetMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return Number.isNaN(targetMs) || left <= 0 ? null : split(left);
}
