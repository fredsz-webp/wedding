import { useEffect, useMemo, useState } from 'react';
import { subscribeGuests, type Guest } from '../lib/guests';

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeGuests(
        (data) => {
          setGuests(data);
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
    const total = guests.length;
    const opened = guests.filter((g) => g.opened).length;
    return { total, opened };
  }, [guests]);

  return { guests, loading, error, stats };
}
