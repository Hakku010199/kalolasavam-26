import { useEffect, useState } from "react";
import { DEFAULT_DATA } from "./defaultData.js";

const API = import.meta.env.VITE_API_URL || "";
const CACHE_KEY = "stagefinder:data_v2";

export default function useStageData() {
  const [data, setData] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      return cached?.stages?.length ? cached : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/data`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d && (d.stages?.length || d.items?.length)) {
          setData(d);
          setError(false);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(d));
          } catch {}
        }
      })
      .catch(() => {
        // If server is not running, gracefully keep local default data
        setError(false);
      });
  }, []);

  return { data, error };
}
