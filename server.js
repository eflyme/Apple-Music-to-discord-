const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// Serve the profile pictures
app.use(express.static(path.join(__dirname, "public")));

let status = {
  currentApp: "Unknown",
  appOpenedAt: null,

  // Device starts online
  online: true,
  lastSeen: Date.now(),

  nowPlaying: {
    title: null,
    artist: null,
    album: null
  }
};


// ═════════════════════════════════════════════
// API
// ═════════════════════════════════════════════

app.get("/api/status", (req, res) => {

  // Consider device offline if we haven't
  // heard from it for 30 seconds.
  const isOnline =
    Date.now() - status.lastSeen < 30000;

  status.online = isOnline;

  res.json(status);
});


// ═════════════════════════════════════════════
// CURRENT APP
// ═════════════════════════════════════════════

app.post("/app", (req, res) => {

  const appName =
    req.body?.app ||
    req.body?.name ||
    req.body?.application ||
    req.body?.text;

  if (!appName) {

    return res.status(400).json({
      ok: false,
      error: "No app name received"
    });

  }

  if (status.currentApp !== String(appName)) {

    status.currentApp = String(appName);

    status.appOpenedAt = Date.now();

  }

  status.lastSeen = Date.now();
  status.online = true;

  res.json({
    ok: true,
    currentApp: status.currentApp,
    appOpenedAt: status.appOpenedAt
  });
});


// ═════════════════════════════════════════════
// HEARTBEAT
// ═════════════════════════════════════════════

app.post("/heartbeat", (req, res) => {

  status.lastSeen = Date.now();
  status.online = true;

  res.json({
    ok: true,
    online: true
  });

});


// ═════════════════════════════════════════════
// MUSIC
// ═════════════════════════════════════════════

app.post("/now-playing", (req, res) => {

  status.nowPlaying = {

    title:
      req.body?.title || null,

    artist:
      req.body?.artist || null,

    album:
      req.body?.album || null

  };

  status.lastSeen = Date.now();
  status.online = true;

  res.json({
    ok: true,
    status
  });

});


// ═════════════════════════════════════════════
// CLEAR MUSIC
// ═════════════════════════════════════════════

app.post("/now-playing/clear", (req, res) => {

  status.nowPlaying = {

    title: null,
    artist: null,
    album: null

  };

  status.lastSeen = Date.now();
  status.online = true;

  res.json({
    ok: true
  });

});


// ═════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════

app.get("/", (req, res) => {

res.send(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>

<title>iPhone Status</title>

<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  min-height: 100vh;

  background:
    radial-gradient(
      circle at top left,
      rgba(88,101,242,.16),
      transparent 35%
    ),
    #0b0d10;

  color: #f2f3f5;

  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;

  padding: 35px 18px;

}

.dashboard {

  width: 100%;

  max-width: 700px;

  margin: auto;

}


/* HEADER */

.header {

  display: flex;

  align-items: center;

  gap: 14px;

  margin-bottom: 24px;

}

.header-icon {

  width: 48px;
  height: 48px;

  border-radius: 14px;

  display: flex;

  align-items: center;
  justify-content: center;

  background:
    linear-gradient(
      135deg,
      #5865f2,
      #7289da
    );

  font-size: 24px;

}

.header h1 {

  margin: 0;

  font-size: 25px;

}

.header p {

  margin: 3px 0 0;

  color: #949ba4;

  font-size: 13px;

}


/* CARDS */

.card {

  background: #111317;

  border: 1px solid #20242b;

  border-radius: 16px;

  margin-bottom: 15px;

  overflow: hidden;

  box-shadow:
    0 10px 35px rgba(0,0,0,.28);

}


/* CARD HEADER */

.card-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 19px 21px 0;

}

.card-title {

  color: #949ba4;

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: .8px;

}


/* PROFILE */

.profile {

  padding: 20px 21px;

  display: flex;

  align-items: center;

  gap: 15px;

}

.profile-picture {

  width: 68px;
  height: 68px;

  border-radius: 50%;

  object-fit: cover;

  border: 3px solid #23a559;

  box-shadow:
    0 0 0 4px rgba(35,165,89,.10);

}

.profile-picture.offline {

  border-color: #747f8d;

  box-shadow: none;

}

.username {

  font-size: 21px;

  font-weight: 650;

}

.online {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 4px;

  color: #8d939c;

  font-size: 13px;

}

.dot {

  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #23a559;

}

.dot.offline {

  background: #747f8d;

}


/* APP */

.app-content {

  padding: 18px 21px 21px;

}

.app-row {

  display: flex;

  align-items: center;

  gap: 15px;

}

.app-icon {

  width: 58px;
  height: 58px;

  border-radius: 15px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #1b1e24;

  border: 1px solid #292d35;

  font-size: 28px;

}

.app-name {

  font-size: 21px;

  font-weight: 650;

}


/* TIMER */

.timer {

  display: flex;

  justify-content: space-between;

  margin-top: 17px;

  padding-top: 14px;

  border-top: 1px solid #20242b;

}

.timer-label {

  color: #8d939c;

  font-size: 13px;

}

.timer-value {

  font-size: 14px;

  font-weight: 600;

  font-variant-numeric: tabular-nums;

}


/* MUSIC */

.music-content {

  padding: 18px 21px 21px;

}

.music-row {

  display: flex;

  align-items: center;

  gap: 16px;

}

.album-art {

  width: 78px;
  height: 78px;

  flex-shrink: 0;

  border-radius: 11px;

  display: flex;

  align-items: center;
  justify-content: center;

  background:
    linear-gradient(
      135deg,
      #5865f2,
      #8c52ff
    );

  font-size: 31px;

}

.song {

  font-size: 19px;

  font-weight: 650;

}

.artist {

  margin-top: 4px;

  color: #b5bac1;

  font-size: 14px;

}

.album {

  margin-top: 4px;

  color: #6f747c;

  font-size: 12px;

}


/* NOT PLAYING */

.not-playing {

  display: flex;

  align-items: center;

  gap: 15px;

  color: #949ba4;

}

.not-playing-icon {

  width: 58px;
  height: 58px;

  border-radius: 14px;

  display: flex;

  align-items: center;
  justify-content: center;

  background: #1b1e24;

  font-size: 25px;

}


/* FOOTER */

.footer {

  text-align: center;

  color: #555b64;

  font-size: 11px;

  margin-top: 20px;

}


/* MOBILE */

@media (max-width: 500px) {

  body {
    padding: 25px 13px;
  }

  .profile {
    padding: 18px;
  }

  .profile-picture {
    width: 60px;
    height: 60px;
  }

}

</style>

</head>


<body>


<div class="dashboard">


  <!-- PROFILE -->

  <div class="card">

    <div class="profile">

      <img
        id="profilePicture"
        class="profile-picture"
        src="/online.jpg"
      >

      <div>

        <div class="username">
          iPhone
        </div>

        <div class="online">

          <span
            id="statusDot"
            class="dot"
          ></span>

          <span id="onlineText">
            Online
          </span>

        </div>

      </div>

    </div>

  </div>


  <!-- CURRENT APP -->

  <div class="card">

    <div class="card-header">

      <div class="card-title">
        Currently Using
      </div>

    </div>


    <div class="app-content">

      <div class="app-row">

        <div
          class="app-icon"
          id="appIcon"
        >
          📱
        </div>

        <div>

          <div
            class="app-name"
            id="appName"
          >
            Unknown
          </div>

        </div>

      </div>


      <div class="timer">

        <div class="timer-label">
          Opened for
        </div>

        <div
          class="timer-value"
          id="timer"
        >
          00:00:00
        </div>

      </div>

    </div>

  </div>


  <!-- MUSIC -->

  <div class="card">

    <div class="card-header">

      <div class="card-title">
        Music
      </div>

      <div id="musicStatus">
        Not playing
      </div>

    </div>


    <div
      class="music-content"
      id="musicContent"
    >

      <div class="not-playing">

        <div class="not-playing-icon">
          🎵
        </div>

        <div>
          Music not playing
        </div>

      </div>

    </div>

  </div>


  <div class="footer">
    Updates automatically
  </div>


</div>


<script>


// ═══════════════════════════════════════════
// APP ICONS
// ═══════════════════════════════════════════

function getAppIcon(name) {

  if (!name) return "📱";

  const app =
    name.toLowerCase();

  if (app.includes("music")) return "🎵";
  if (app.includes("spotify")) return "🟢";
  if (app.includes("youtube")) return "▶️";
  if (app.includes("instagram")) return "📸";
  if (app.includes("discord")) return "💬";
  if (app.includes("safari")) return "🧭";
  if (app.includes("chrome")) return "🌐";
  if (app.includes("messages")) return "💬";
  if (app.includes("photos")) return "🌅";
  if (app.includes("camera")) return "📷";
  if (app.includes("settings")) return "⚙️";
  if (app.includes("mail")) return "✉️";
  if (app.includes("maps")) return "🗺️";
  if (app.includes("reddit")) return "👽";
  if (app.includes("tiktok")) return "🎵";
  if (app.includes("netflix")) return "🎬";

  return "📱";
}


// ═══════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════

let appOpenedAt = null;

function updateTimer() {

  const timer =
    document.getElementById("timer");

  if (!appOpenedAt) {

    timer.textContent =
      "00:00:00";

    return;

  }

  const seconds =
    Math.max(
      0,
      Math.floor(
        (Date.now() - appOpenedAt)
        / 1000
      )
    );

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const secs =
    seconds % 60;

  timer.textContent =
    String(hours).padStart(2,"0")
    + ":" +
    String(minutes).padStart(2,"0")
    + ":" +
    String(secs).padStart(2,"0");

}


// ═══════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════

async function updateStatus() {

  try {

    const response =
      await fetch(
        "/api/status",
        {
          cache: "no-store"
        }
      );

    const data =
      await response.json();


    // ─────────────────────────
    // ONLINE / OFFLINE
    // ─────────────────────────

    const picture =
      document.getElementById(
        "profilePicture"
      );

    const dot =
      document.getElementById(
        "statusDot"
      );

    const onlineText =
      document.getElementById(
        "onlineText"
      );


    if (data.online) {

      picture.src =
        "/online.jpg";

      picture.classList.remove(
        "offline"
      );

      dot.classList.remove(
        "offline"
      );

      onlineText.textContent =
        "Online";

    } else {

      picture.src =
        "/offline.jpg";

      picture.classList.add(
        "offline"
      );

      dot.classList.add(
        "offline"
      );

      onlineText.textContent =
        "Offline";

    }


    // ─────────────────────────
    // APP
    // ─────────────────────────

    const appName =
      data.currentApp ||
      "Unknown";

    document
      .getElementById("appName")
      .textContent =
        appName;

    document
      .getElementById("appIcon")
      .textContent =
        getAppIcon(appName);

    appOpenedAt =
      data.appOpenedAt;


    // ─────────────────────────
    // MUSIC
    // ─────────────────────────

    const music =
      data.nowPlaying || {};

    const content =
      document.getElementById(
        "musicContent"
      );

    const musicStatus =
      document.getElementById(
        "musicStatus"
      );


    if (music.title) {

      musicStatus.textContent =
        "Playing";

      musicStatus.style.color =
        "#23a559";


      content.innerHTML = \`

        <div class="music-row">

          <div class="album-art">
            🎵
          </div>

          <div>

            <div class="song">
              \${escapeHtml(
                music.title
              )}
            </div>

            <div class="artist">
              \${escapeHtml(
                music.artist ||
                "Unknown artist"
              )}
            </div>

            <div class="album">
              \${escapeHtml(
                music.album || ""
              )}
            </div>

          </div>

        </div>

      \`;

    } else {

      musicStatus.textContent =
        "Not playing";

      musicStatus.style.color =
        "#8d939c";


      content.innerHTML = \`

        <div class="not-playing">

          <div class="not-playing-icon">
            🎵
          </div>

          <div>
            Music not playing
          </div>

        </div>

      \`;

    }

  }

  catch (error) {

    console.log(
      "Update failed:",
      error
    );

  }

}


function escapeHtml(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// ═══════════════════════════════════════════
// START
// ═══════════════════════════════════════════

updateStatus();

setInterval(
  updateStatus,
  3000
);

setInterval(
  updateTimer,
  1000
);

</script>


</body>

</html>

`);

});


// ═════════════════════════════════════════════
// SERVER
// ═════════════════════════════════════════════

const PORT =
  process.env.PORT || 10000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "iPhone Status running on port " +
      PORT
    );

  }
);