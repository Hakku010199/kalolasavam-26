import { useState, useEffect, useCallback } from "react";

const NAMESPACE = "kalolsavam26-alathiyur"; // unique namespace for this app
const API_BASE = `https://api.counterapi.dev/v1/${NAMESPACE}`;

export default function LikeButton({ itemId = "app-likes" }) {
  const storageKey = `liked_${itemId}`;
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);
  const [popping, setPopping] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState([]);

  // Fetch the global count on mount
  useEffect(() => {
    fetch(`${API_BASE}/${itemId}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.count === "number") setCount(d.count);
      })
      .catch(() => {}); // silently fail — show 0
  }, [itemId]);

  const spawnParticles = useCallback(() => {
    const emojis = ["❤️", "💖", "✨", "🔥", "⭐", "🎉", "💕"];
    const count = 4 + Math.floor(Math.random() * 3);
    const particles = Array.from({ length: count }, () => ({
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 80,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setFloatingParticles(particles);
    setTimeout(() => setFloatingParticles([]), 1200);
  }, []);

  const handleClick = useCallback(async () => {
    if (loading) return;

    const willLike = !liked;

    // --- Optimistic UI update ---
    setLiked(willLike);
    setCount((c) => c + (willLike ? 1 : -1));
    setPopping(true);
    setTimeout(() => setPopping(false), 320);
    if (willLike) spawnParticles();

    setLoading(true);

    try {
      const endpoint = willLike ? "up" : "down";
      const res = await fetch(`${API_BASE}/${itemId}/${endpoint}`);
      const data = await res.json();

      if (typeof data?.count === "number") {
        // Sync with actual server count
        setCount(data.count);
      }

      // Persist like state only after successful API call
      try {
        localStorage.setItem(storageKey, String(willLike));
      } catch {}
    } catch {
      // Revert on failure
      setLiked(!willLike);
      setCount((c) => c + (willLike ? -1 : 1));
    } finally {
      setLoading(false);
    }
  }, [liked, loading, itemId, storageKey, spawnParticles]);

  return (
    <div className="lb-wrapper">
      <button
        className={`lb-btn ${liked ? "lb-liked" : ""} ${popping ? "lb-popping" : ""}`}
        onClick={handleClick}
        disabled={loading}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
      >
        <span className="lb-heart" aria-hidden="true">
          {liked ? "❤️" : "🤍"}
        </span>
        <span className="lb-label">{liked ? "Liked" : "Like"}</span>
        <span className="lb-count">{count.toLocaleString()}</span>
      </button>

      {/* Floating burst particles */}
      {floatingParticles.map((p) => (
        <span
          key={p.id}
          className="lb-particle"
          style={{ "--dx": `${p.x}px` }}
          aria-hidden="true"
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
