import { useEffect, useMemo, useState } from 'react';
import { subscribeRsvps, type RsvpEntry } from '../lib/rsvps';

export function useRsvps() {
  const [entries, setEntries] = useState<RsvpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeRsvps(
        (data) => {
          setEntries(data);
          setLoading(false);
          setError(null);
        },
        (e) => {
          setError(e.message);
          setLoading(false);
        },
      ),
    [],
  );

  const stats = useMemo(() => {
    const hadir = entries.filter((e) => e.attending).length;
    const tidak = entries.filter((e) => !e.attending).length;
    const ucapan = entries.filter((e) => e.message.trim()).length;
    const paxHadir = entries.filter((e) => e.attending).reduce((s, e) => s + (e.pax || 1), 0);
    return { hadir, tidak, ucapan, paxHadir, total: entries.length };
  }, [entries]);

  return { entries, loading, error, stats };
}
