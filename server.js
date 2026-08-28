const express = require("express");

const app = express();

app.use(express.json({ limit: "2mb" }));

// ═════════════════════════════════════════════
// STATUS
// ═════════════════════════════════════════════

let status = {
  currentApp: "Unknown",
  appOpenedAt: null,

  nowPlaying: {
    title: null,
    artist: null,
    album: null,
    artwork: null
  }
};


// ═════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════

function clean(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ═════════════════════════════════════════════
// API — GET STATUS
// ═════════════════════════════════════════════

app.get("/api/status", (req, res) => {
  res.json(status);
});


// ═════════════════════════════════════════════
// API — CURRENT APP
// ═════════════════════════════════════════════

app.post("/app", (req, res) => {

  console.log("App request:", req.body);

  const appName =
    clean(req.body?.app) ||
    clean(req.body?.name) ||
    clean(req.body?.application) ||
    clean(req.body?.text);

  if (!appName) {
    return res.status(400).json({
      ok: false,
      error: "No app name received",
      received: req.body
    });
  }

  // Only restart timer when app changes
  if (status.currentApp !== appName) {

    status.currentApp = appName;

    status.appOpenedAt = Date.now();

  }

  res.json({
    ok: true,
    currentApp: status.currentApp,
    appOpenedAt: status.appOpenedAt
  });
});


// ═════════════════════════════════════════════
// API — NOW PLAYING
// ═════════════════════════════════════════════

app.post("/now-playing", (req, res) => {

  console.log("Music request:", req.body);

  status.nowPlaying = {

    title:
      clean(req.body?.title),

    artist:
      clean(req.body?.artist),

    album:
      clean(req.body?.album),

    artwork:
      clean(req.body?.artwork)

  };

  res.json({
    ok: true,
    status: status.nowPlaying
  });
});


// ═════════════════════════════════════════════
// API — CLEAR MUSIC
// ═════════════════════════════════════════════

app.post("/now-playing/clear", (req, res) => {

  status.nowPlaying = {

    title: null,
    artist: null,
    album: null,
    artwork: null

  };

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

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<meta
  name="theme-color"
  content="#0b0d10"
>

<title>iPhone Status</title>


<style>

/* ═══════════════════════════════════════════
   BASE
═══════════════════════════════════════════ */

* {
  box-sizing: border-box;
}

html {
  background: #0b0d10;
}

body {

  margin: 0;

  min-height: 100vh;

  background:

    radial-gradient(
      circle at 10% 0%,
      rgba(88,101,242,.16),
      transparent 32%
    ),

    radial-gradient(
      circle at 90% 100%,
      rgba(114,137,218,.08),
      transparent 35%
    ),

    #0b0d10;

  color: #f2f3f5;

  font-family:

    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;

  padding: 35px 18px 50px;

}


/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */

.dashboard {

  width: 100%;

  max-width: 700px;

  margin: 0 auto;

}


/* ═══════════════════════════════════════════
   HEADER
═══════════════════════════════════════════ */

.header {

  display: flex;

  align-items: center;

  gap: 14px;

  margin-bottom: 24px;

}

.header-icon {

  width: 48px;
  height: 48px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      #5865f2,
      #7289da
    );

  font-size: 24px;

  box-shadow:
    0 8px 25px rgba(88,101,242,.25);

}

.header h1 {

  margin: 0;

  font-size: 25px;

  font-weight: 700;

  letter-spacing: -.5px;

}

.header p {

  margin: 3px 0 0;

  color: #949ba4;

  font-size: 13px;

}


/* ═══════════════════════════════════════════
   CARD
═══════════════════════════════════════════ */

.card {

  background: rgba(17,19,23,.94);

  border: 1px solid #20242b;

  border-radius: 16px;

  margin-bottom: 15px;

  overflow: hidden;

  box-shadow:
    0 10px 35px rgba(0,0,0,.28);

}


/* ═══════════════════════════════════════════
   CARD HEADER
═══════════════════════════════════════════ */

.card-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 19px 21px 0;

}

.card-title {

  color: #949ba4;

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: .8px;

}


/* ═══════════════════════════════════════════
   APP
═══════════════════════════════════════════ */

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

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background: #1b1e24;

  border: 1px solid #292d35;

  font-size: 28px;

}

.app-name {

  font-size: 21px;

  font-weight: 650;

  color: #ffffff;

}

.active {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 4px;

  color: #8d939c;

  font-size: 13px;

}

.active-dot {

  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #23a559;

  box-shadow:
    0 0 8px rgba(35,165,89,.65);

}


/* ═══════════════════════════════════════════
   TIMER
═══════════════════════════════════════════ */

.timer {

  display: flex;

  align-items: center;

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

  color: #dbdee1;

  font-size: 14px;

  font-weight: 600;

  font-variant-numeric: tabular-nums;

}


/* ═══════════════════════════════════════════
   MUSIC STATUS
═══════════════════════════════════════════ */

.music-status {

  font-size: 12px;

  color: #8d939c;

}

.music-status.playing {

  color: #23a559;

}


/* ═══════════════════════════════════════════
   MUSIC CONTENT
═══════════════════════════════════════════ */

.music-content {

  padding: 18px 21px 21px;

}

.music-row {

  display: flex;

  align-items: center;

  gap: 16px;

}


/* ═══════════════════════════════════════════
   ALBUM ART
═══════════════════════════════════════════ */

.album-art {

  width: 78px;
  height: 78px;

  flex-shrink: 0;

  border-radius: 11px;

  overflow: hidden;

  display: flex;

  align-items: center;
  justify-content: center;

  background:

    linear-gradient(
      135deg,
      #5865f2,
      #8c52ff
    );

  box-shadow:
    0 8px 25px rgba(0,0,0,.35);

  font-size: 31px;

}

.album-art img {

  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

}


/* ═══════════════════════════════════════════
   SONG INFO
═══════════════════════════════════════════ */

.music-info {

  min-width: 0;

}

.song {

  color: #ffffff;

  font-size: 19px;

  font-weight: 650;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}

.artist {

  margin-top: 4px;

  color: #b5bac1;

  font-size: 14px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}

.album {

  margin-top: 4px;

  color: #6f747c;

  font-size: 12px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}


/* ═══════════════════════════════════════════
   NOT PLAYING
═══════════════════════════════════════════ */

.not-playing {

  display: flex;

  align-items: center;

  gap: 15px;

  color: #949ba4;

  font-size: 15px;

}

.not-playing-icon {

  width: 58px;
  height: 58px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: #1b1e24;

  border: 1px solid #292d35;

  font-size: 25px;

}


/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */

.footer {

  text-align: center;

  margin-top: 20px;

  color: #555b64;

  font-size: 11px;

}


/* ═══════════════════════════════════════════
   MOBILE
═══════════════════════════════════════════ */

@media (max-width: 500px) {

  body {

    padding:
      25px 13px 40px;

  }

  .header h1 {

    font-size: 23px;

  }

  .card-header {

    padding:
      17px 18px 0;

  }

  .app-content,
  .music-content {

    padding:
      16px 18px 19px;

  }

  .album-art {

    width: 70px;
    height: 70px;

  }

  .song {

    font-size: 17px;

  }

}

</style>

</head>


<body>


<div class="dashboard">


  <!-- HEADER -->

  <div class="header">

    <div class="header-icon">
      📱
    </div>

    <div>

      <h1>
        iPhone Status
      </h1>

      <p>
        Live activity dashboard
      </p>

    </div>

  </div>


  <!-- ═══════════════════════════════
       APP CARD
  ═══════════════════════════════ -->

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


          <div class="active">

            <span class="active-dot"></span>

            Active

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


  <!-- ═══════════════════════════════
       MUSIC CARD
  ═══════════════════════════════ -->

  <div class="card">

    <div class="card-header">

      <div class="card-title">
        Music
      </div>


      <div
        class="music-status"
        id="musicStatus"
      >
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

  if (!name) {
    return "📱";
  }

  const app =
    name.toLowerCase();

  if (app.includes("music"))
    return "🎵";

  if (app.includes("spotify"))
    return "🟢";

  if (app.includes("youtube"))
    return "▶️";

  if (app.includes("instagram"))
    return "📸";

  if (app.includes("discord"))
    return "💬";

  if (app.includes("safari"))
    return "🧭";

  if (app.includes("chrome"))
    return "🌐";

  if (app.includes("messages"))
    return "💬";

  if (app.includes("photos"))
    return "🌅";

  if (app.includes("camera"))
    return "📷";

  if (app.includes("settings"))
    return "⚙️";

  if (app.includes("mail"))
    return "✉️";

  if (app.includes("maps"))
    return "🗺️";

  if (app.includes("reddit"))
    return "👽";

  if (app.includes("tiktok"))
    return "🎵";

  if (app.includes("netflix"))
    return "🎬";

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


  const elapsed =
    Math.max(
      0,
      Math.floor(
        (Date.now() - appOpenedAt)
        / 1000
      )
    );


  const hours =
    Math.floor(
      elapsed / 3600
    );

  const minutes =
    Math.floor(
      (elapsed % 3600) / 60
    );

  const seconds =
    elapsed % 60;


  timer.textContent =

    String(hours)
      .padStart(2, "0")

    + ":" +

    String(minutes)
      .padStart(2, "0")

    + ":" +

    String(seconds)
      .padStart(2, "0");

}


// ═══════════════════════════════════════════
// UPDATE DASHBOARD
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


      musicStatus.classList.add(
        "playing"
      );


      const artwork =
        music.artwork;


      const artworkHTML =
        artwork

          ? \`
            <img
              src="\${escapeHtml(artwork)}"
              alt="Album artwork"
              onerror="
                this.style.display='none';
              "
            >
          \`

          : "🎵";


      content.innerHTML = \`

        <div class="music-row">

          <div class="album-art">

            \${artworkHTML}

          </div>


          <div class="music-info">

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


            \${
              music.album

                ? \`
                  <div class="album">

                    \${escapeHtml(
                      music.album
                    )}

                  </div>
                \`

                : ""
            }

          </div>

        </div>

      \`;

    }

    else {

      musicStatus.textContent =
        "Not playing";


      musicStatus.classList.remove(
        "playing"
      );


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
      "Status update failed:",
      error
    );

  }

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
// START SERVER
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