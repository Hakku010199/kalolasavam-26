import { useState, useEffect } from "react";
import { stagesData } from "./stagesData.js";
import LikeButton from "./LikeButton.jsx";

function parseDmsPart(str) {
  const m = str.match(/([0-9.]+)[°\s]+([0-9.]+)?['\s]*([0-9.]+)?[\"\s]*([NSEW])/i);
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
  if (stage.lat && stage.lng)
    return `https://www.google.com/maps/dir/?api=1&destination=${stage.lat},${stage.lng}`;
  if (stage.coords?.trim()) {
    const parsed = parseDms(stage.coords);
    if (parsed)
      return `https://www.google.com/maps/dir/?api=1&destination=${parsed.lat},${parsed.lng}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stage.coords.trim())}`;
  }
  return null;
}

export default function App() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showLikePopup, setShowLikePopup] = useState(false);
  const [likePopupDismissed, setLikePopupDismissed] = useState(false);

  // Show like popup after 3 seconds on mount (once per session)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!likePopupDismissed) setShowLikePopup(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [likePopupDismissed]);

  const closeLikePopup = () => {
    setShowLikePopup(false);
    setLikePopupDismissed(true);
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

        <div className="schedule-btn-wrap">
          <button
            className="schedule-btn"
            onClick={() => { setZoom(1); setShowSchedule(true); }}
          >
            📋 മത്സര ഇനങ്ങളും വേദിയും
          </button>
        </div>
      </header>

      {/* Floating Schedule Button */}
      <button
        className="floating-side-btn"
        onClick={() => { setZoom(1); setShowSchedule(true); }}
        aria-label="മത്സര ഇനങ്ങളും വേദിയും"
      >
        📋 ഷെഡ്യൂൾ
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
                    {stage.venue && <div className="vedhi-venue">📍 {stage.venue}</div>}
                    <div className="vedhi-coord">
                      {stage.coords || "ലൊക്കേഷൻ ഉടൻ ചേർക്കും"}
                    </div>
                  </div>
                </div>
                <div className="vedhi-actions">
                  {mapUrl ? (
                    <a className="arrow-btn" href={mapUrl} target="_blank" rel="noopener noreferrer">
                      <span className="arrow-icon">➤</span>
                      <span>വഴി</span>
                    </a>
                  ) : (
                    <button
                      className="arrow-btn disabled"
                      onClick={() => alert(`${stage.name} (${stage.venue}) - ലൊക്കേഷൻ ഉടൻ ചേർക്കുന്നതാണ്`)}
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
      </main>

      {/* Like Popup (appears after 3 seconds) */}
      {showLikePopup && (
        <div className="like-popup-backdrop" onClick={closeLikePopup}>
          <div className="like-popup" onClick={(e) => e.stopPropagation()}>
            <button className="like-popup-close" onClick={closeLikePopup} aria-label="Close">✕</button>
            <div onClick={closeLikePopup}>
              <LikeButton itemId="app-likes" />
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="modal-backdrop" onClick={() => setShowSchedule(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>📋 മത്സര ഇനങ്ങളും വേദിയും</h3>
                <span className="zoom-indicator">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="modal-actions">
                <button className="zoom-btn" onClick={zoomIn}>🔍+</button>
                <button className="zoom-btn" onClick={zoomOut}>🔍-</button>
                <button className="zoom-btn" onClick={resetZoom}>100%</button>
                <a className="modal-full-btn" href="/schedule.jpg" target="_blank" rel="noopener noreferrer">
                  പുറത്ത് കാണുക ↗
                </a>
                <button className="modal-close-btn" onClick={() => setShowSchedule(false)}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              <div
                className="zoom-wrapper"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.15s ease-out" }}
              >
                <img src="/schedule.jpg" alt="മത്സര ഇനങ്ങളും വേദിയും" className="schedule-img" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
