import { useState, useEffect, useCallback } from "react";

// CounterAPI v2 namespace & key
// To connect to a live shared cloud counter across all devices:
// 1. Create a free workspace at https://counterapi.dev (named "kalolsavam26")
// 2. Any device that clicks will instantly sync to this global counter!
const NAMESPACE = "kalolsavam26";
const KEY = "app-likes";
const API_BASE = `https://api.counterapi.dev/v2/${NAMESPACE}/${KEY}`;

export default function LikeButton({ itemId = "app-likes" }) {
  const storageKey = `liked_${itemId}`;
  const localCountKey = `like_count_${itemId}`;

  // Read saved like state and count from localStorage
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });

  const [count, setCount] = useState(() => {
    try {
      const saved = localStorage.getItem(localCountKey);
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [loading, setLoading] = useState(false);
  const [popping, setPopping] = useState(false);

  // Fetch current global count on mount
  useEffect(() => {
    let isMounted = true;
    fetch(API_BASE)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!isMounted) return;
        const val = d?.count ?? d?.value ?? d?.hits;
        if (typeof val === "number") {
          setCount(val);
          try {
            localStorage.setItem(localCountKey, String(val));
          } catch {}
        }
      })
      .catch(() => {
        // If CounterAPI workspace is not yet initialized, gracefully keep local count (starts at 0)
      });

    return () => {
      isMounted = false;
    };
  }, [localCountKey]);

  const handleClick = useCallback(async () => {
    if (loading) return;

    const willLike = !liked;
    const nextCount = Math.max(0, count + (willLike ? 1 : -1));

    // Optimistic UI update
    setLiked(willLike);
    setCount(nextCount);
    setPopping(true);
    setTimeout(() => setPopping(false), 320);

    try {
      localStorage.setItem(storageKey, String(willLike));
      localStorage.setItem(localCountKey, String(nextCount));
    } catch {}

    setLoading(true);

    try {
      const endpoint = willLike ? "up" : "down";
      const res = await fetch(`${API_BASE}/${endpoint}`);
      if (res.ok) {
        const data = await res.json();
        const serverCount = data?.count ?? data?.value ?? data?.hits;
        if (typeof serverCount === "number") {
          setCount(serverCount);
          try {
            localStorage.setItem(localCountKey, String(serverCount));
          } catch {}
        }
      }
    } catch {
      // Keep optimistic count even if offline
    } finally {
      setLoading(false);
    }
  }, [liked, count, loading, storageKey, localCountKey]);

  return (
    <div className="lb-wrapper">
      <button
        className={`lb-btn${liked ? " lb-liked" : ""}${popping ? " lb-popping" : ""}`}
        onClick={handleClick}
        disabled={loading}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
      >
        <span className="lb-heart" aria-hidden="true">
          {liked ? "❤️" : "🤍"}
        </span>
        <span className="lb-label">{liked ? "ലൈക്ക് ചെയ്തു" : "ലൈക്ക്"}</span>
        <span className="lb-count">{count.toLocaleString()}</span>
      </button>
    </div>
  );
}
