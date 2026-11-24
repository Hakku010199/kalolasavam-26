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
        </div>
        <h1>വേദിയിലേക്കുള്ള വഴി അറിയണോ?</h1>
        <p className="subtitle">'വഴി' എന്ന ബട്ടണിൽ ക്ലിക്ക് ചെയ്യൂ</p>
      </header>

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
      </main>
    </>
  );
}
