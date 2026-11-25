import { useState, useEffect, useCallback } from "react";

const NAMESPACE = "kalolsavam26";
const KEY = "app-likes";
const API_BASE = `https://api.counterapi.dev/v2/${NAMESPACE}/${KEY}`;

export default function LikeButton({ itemId = "app-likes" }) {
  const storageKey = `liked_${itemId}`;

  const [count, setCount] = useState(null); // null = loading
  const [liked, setLiked] = useState(() => {
    try { return localStorage.getItem(storageKey) === "true"; } catch { return false; }
  });
  const [loading, setLoading] = useState(false);
  const [popping, setPopping] = useState(false);

  // Fetch current global count on mount
  useEffect(() => {
    fetch(API_BASE)
      .then((r) => r.json())
      .then((d) => {
        const val = d?.count ?? d?.value ?? d?.hits ?? 0;
        setCount(typeof val === "number" ? val : 0);
      })
      .catch(() => setCount(0));
  }, []);

  const handleClick = useCallback(async () => {
    if (loading) return;

    const willLike = !liked;

    // Optimistic update
    setLiked(willLike);
    setCount((c) => (c ?? 0) + (willLike ? 1 : -1));
    setPopping(true);
    setTimeout(() => setPopping(false), 320);

    setLoading(true);
    try {
      const endpoint = willLike ? "up" : "down";
      const res = await fetch(`${API_BASE}/${endpoint}`);
      const data = await res.json();
      const serverCount = data?.count ?? data?.value ?? data?.hits;
      if (typeof serverCount === "number") setCount(serverCount);
      try { localStorage.setItem(storageKey, String(willLike)); } catch {}
    } catch {
      // Revert on failure
      setLiked(!willLike);
      setCount((c) => (c ?? 0) + (willLike ? -1 : 1));
    } finally {
      setLoading(false);
    }
  }, [liked, loading, storageKey]);

  return (
    <div className="lb-wrapper">
      <button
        className={`lb-btn${liked ? " lb-liked" : ""}${popping ? " lb-popping" : ""}`}
        onClick={handleClick}
        disabled={loading}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
      >
        <span className="lb-heart" aria-hidden="true">{liked ? "❤️" : "🤍"}</span>
        <span className="lb-label">{liked ? "Liked!" : "Like"}</span>
        <span className="lb-count">
          {count === null ? "…" : count.toLocaleString()}
        </span>
      </button>
    </div>
  );
}
