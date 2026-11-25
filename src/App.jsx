import { useState } from "react";
import { stagesData } from "./stagesData.js";

// DMS parser in case coordinates are pasted as "10°51'45.9\"N 75°56'07.2\"E"
function parseDmsPart(str) {
  const m = str.match(
    /([0-9.]+)[°\s]+([0-9.]+)?['\s]*([0-9.]+)?[\"\s]*([NSEW])/i
  );
  if (!m) return null;
  const deg = parseFloat(m[1]) || 0;
  const min = parseFloat(m[2]) || 0;
  const sec = parseFloat(m[3]) || 0;
  const dir = m[4].toUpperCase();
  let dd = deg + min / 60 + sec / 3600;
  if (dir === "S" || dir === "W") dd = -dd;
  return dd;
}

function parseDms(coords) {
  if (!coords) return null;
  const parts = coords.match(/[0-9.]+[°\s]+[0-9.]*['\s]*[0-9.]*[\"\s]*[NSEW]/gi);
  if (parts && parts.length >= 2) {
    const lat = parseDmsPart(parts[0]);
    const lng = parseDmsPart(parts[1]);
    if (lat !== null && lng !== null) return { lat, lng };
  }
  return null;
}

function getMapLink(stage) {
  if (stage.lat && stage.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${stage.lat},${stage.lng}`;
  }
  if (stage.coords && stage.coords.trim()) {
    const parsed = parseDms(stage.coords);
    if (parsed) {
      return `https://www.google.com/maps/dir/?api=1&destination=${parsed.lat},${parsed.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      stage.coords.trim()
    )}`;
  }
  return null;
}

export default function App() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Like system with floating hit animation
  const [likes, setLikes] = useState(() => {
    try {
      return parseInt(localStorage.getItem("stagefinder:likes") || "148", 10);
    } catch {
      return 148;
    }
  });
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = (e) => {
    const newLikes = likes + 1;
    setLikes(newLikes);
    try {
      localStorage.setItem("stagefinder:likes", newLikes);
    } catch {}

    // Trigger button bounce
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Spawn floating particle
    const id = Date.now() + Math.random();
    const x = (Math.random() - 0.5) * 60; // random drift left/right
    const emojis = ["❤️", "💖", "✨", "🔥", "🎉", "👏", "⭐"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    setFloatingHearts((prev) => [...prev, { id, x, emoji }]);

    // Remove particle after animation
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1100);
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.35, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.35, 0.7));
  const resetZoom = () => setZoom(1);

  return (
    <>
      <header>
        <div className="festival-header">
          <div className="festival-badge">
            37-ാമത് മലപ്പുറം റവന്യൂ ജില്ലാ സ്കൂൾ കലോത്സവം
          </div>
          <div className="venue-badge">
            കെ.എച്ച്.എം.എച്ച്.എസ്.എസ് ആലത്തിയൂർ
          </div>
          <div className="date-badge">
            🗓️ 2026 നവംബർ 28, 30 & ഡിസംബർ 01, 02, 03
          </div>
        </div>
        <h1>വേദിയിലേക്കുള്ള വഴി അറിയണോ?</h1>
        <p className="subtitle">'വഴി' എന്ന ബട്ടണിൽ ക്ലിക്ക് ചെയ്യൂ</p>

        {/* Schedule Button */}
        <div className="schedule-btn-wrap">
          <button
            className="schedule-btn"
            onClick={() => {
              setZoom(1);
              setShowSchedule(true);
            }}
            title="മത്സര ഇനങ്ങളും വേദിയും ടൈംടേബിൾ കാണുക"
          >
            📋 മത്സര ഇനങ്ങളും വേദിയും (ഷെഡ്യൂൾ)
          </button>
        </div>
      </header>

      {/* Floating button on the side */}
      <button
        className="floating-side-btn"
        onClick={() => {
          setZoom(1);
          setShowSchedule(true);
        }}
        aria-label="മത്സര ഇനങ്ങളും വേദിയും"
      >
        <span>📋 മത്സര ഇനങ്ങളും വേദിയും</span>
      </button>

      <main>
        <div className="stages-list">
          {stagesData.map((stage) => {
            const mapUrl = getMapLink(stage);
            return (
              <div className="vedhi-card" key={stage.no}>
                <div className="vedhi-main">
                  <div className="vedhi-num">{stage.no}</div>
                  <div className="vedhi-text">
                    <div className="vedhi-name">{stage.name}</div>
                    {stage.venue && (
                      <div className="vedhi-venue">📍 {stage.venue}</div>
                    )}
                    <div className="vedhi-coord">
                      {stage.coords || "ലൊക്കേഷൻ ഉടൻ ചേർക്കും"}
                    </div>
                  </div>
                </div>

                <div className="vedhi-actions">
                  {mapUrl ? (
                    <a
                      className="arrow-btn"
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${stage.name} - വഴി കാണുക`}
                    >
                      <span className="arrow-icon">➤</span>
                      <span>വഴി</span>
                    </a>
                  ) : (
                    <button
                      className="arrow-btn disabled"
                      onClick={() =>
                        alert(
                          `${stage.name} (${stage.venue}) - ലൊക്കേഷൻ ഉടൻ ചേർക്കുന്നതാണ്`
                        )
                      }
                      title="ലൊക്കേഷൻ ഉടൻ ചേർക്കും"
                    >
                      <span className="arrow-icon">➤</span>
                      <span>വഴി</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Beautiful Like Hit Section */}
        <div className="like-section">
          <div className="like-heading">ഈ ആപ്പ് ഉപകാരപ്രദമായോ?</div>
          <div className="like-btn-wrapper">
            <button
              className={`like-hit-btn ${isAnimating ? "animate-hit" : ""}`}
              onClick={handleLike}
              aria-label="Like this app"
            >
              <span className="heart-icon">❤️</span>
              <span className="like-label">Like</span>
              <span className="like-count">{likes.toLocaleString()}</span>
            </button>

            {/* Flying Hit Animation Particles */}
            {floatingHearts.map((h) => (
              <span
                key={h.id}
                className="floating-heart"
                style={{ transform: `translateX(${h.x}px)` }}
              >
                {h.emoji}
              </span>
            ))}
          </div>
          <div className="like-subtext">തട്ടി നോക്കൂ, എത്ര തവണ വേണമെങ്കിലും ലൈക്ക് ചെയ്യാം!</div>
        </div>
      </main>

      {/* High Clarity Modal with Zoom Controls */}
      {showSchedule && (
        <div className="modal-backdrop" onClick={() => setShowSchedule(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>📋 മത്സര ഇനങ്ങളും വേദിയും (ഷെഡ്യൂൾ)</h3>
                <span className="zoom-indicator">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="modal-actions">
                <button
                  className="zoom-btn"
                  onClick={zoomIn}
                  title="Zoom In"
                >
                  🔍+
                </button>
                <button
                  className="zoom-btn"
                  onClick={zoomOut}
                  title="Zoom Out"
                >
                  🔍-
                </button>
                <button
                  className="zoom-btn"
                  onClick={resetZoom}
                  title="Reset Zoom"
                >
                  100%
                </button>
                <a
                  className="modal-full-btn"
                  href="/schedule.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open full resolution in new tab"
                >
                  പുറത്ത് കാണുക ↗
                </a>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowSchedule(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div
                className="zoom-wrapper"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: "transform 0.15s ease-out",
                }}
              >
                <img
                  src="/schedule.jpg"
                  alt="മത്സര ഇനങ്ങളും വേദിയും - High Quality"
                  className="schedule-img"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
