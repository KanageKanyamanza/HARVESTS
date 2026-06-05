import { useState, useEffect } from 'react';

const CACHE_KEY = 'harvests_geo_country';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Hook partagé de géolocalisation par IP.
 * Fait l'appel une seule fois par session (cache sessionStorage).
 * Retourne { countryCode, countryName, detected, loading }
 */
export function useGeoLocation() {
  const [state, setState] = useState(() => {
    // Initialise depuis le cache sessionStorage si disponible
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts < CACHE_TTL) {
          return {
            countryCode: parsed.countryCode,
            countryName: parsed.countryName,
            detected: parsed.detected,
            loading: false,
          };
        }
      }
    } catch {
      // ignore
    }
    return { countryCode: null, countryName: null, detected: false, loading: true };
  });

  useEffect(() => {
    // Déjà chargé depuis le cache
    if (!state.loading) return;

    let cancelled = false;

    const detect = async () => {
      try {
        // Essayer ipapi.co en premier (1000 req/jour gratuites)
        const res = await fetch('https://ipapi.co/json/', { timeout: 5000 });
        const data = await res.json();

        if (!cancelled && data && data.country_code && !data.error) {
          const result = {
            countryCode: data.country_code,
            countryName: data.country_name || data.country_code,
            detected: true,
            loading: false,
          };
          setState(result);
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ ...result, ts: Date.now() })
          );
          return;
        }
      } catch {
        // fallback
      }

      try {
        // Fallback : ip-api.com
        const res2 = await fetch('http://ip-api.com/json/');
        const data2 = await res2.json();

        if (!cancelled && data2 && data2.status === 'success' && data2.countryCode) {
          const result = {
            countryCode: data2.countryCode,
            countryName: data2.country || data2.countryCode,
            detected: true,
            loading: false,
          };
          setState(result);
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ ...result, ts: Date.now() })
          );
          return;
        }
      } catch {
        // ignore
      }

      // Pas de détection
      if (!cancelled) {
        const result = { countryCode: null, countryName: null, detected: false, loading: false };
        setState(result);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ...result, ts: Date.now() })
        );
      }
    };

    detect();

    return () => {
      cancelled = true;
    };
  }, [state.loading]);

  return state;
}
