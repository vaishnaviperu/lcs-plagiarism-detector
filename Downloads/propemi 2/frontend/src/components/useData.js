import { useState, useEffect, useCallback } from "react";

export function useData(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then(d  => { if (!cancelled) { setData(d);         setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(load, [load]);
  return { data, loading, error, reload: load };
}
