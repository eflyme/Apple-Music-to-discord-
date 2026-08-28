const express = require("express");

const app = express();
app.use(express.json());

let status = {
  currentApp: "Unknown",
  nowPlaying: {
    title: null,
    artist: null,
    album: null
  }
};

// ─────────────────────────────
// API
// ─────────────────────────────

app.get("/api/status", (req, res) => {
  res.json(status);
});

app.post("/app", (req, res) => {
  if (req.body.app) {
    status.currentApp = req.body.app;
  }

  res.json({
    ok: true,
    status
  });
});

app.post("/now-playing", (req, res) => {
  status.nowPlaying = {
    title: req.body.title || null,
    artist: req.body.artist || null,
    album: req.body.album || null
  };

  res.json({
    ok: true,
    status
  });
});

app.post("/now-playing/clear", (req, res) => {
  status.nowPlaying = {
    title: null,
    artist: null,
    album: null
  };

  res.json({
    ok: true,
    status
  });
});

// ─────────────────────────────
// Dashboard
// ─────────────────────────────

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
      rgba(88, 101, 242, 0.15),
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

  padding: 40px 20px;
}

.dashboard {
  width: 100%;
  max-width: 680px;
  margin: auto;
}

/* Header */

.header {
  margin-bottom: 22px;
}

.header h1 {
  margin: 0;

  font-size: 28px;
  font-weight: 700;

  letter-spacing: -0.5px;
}

.header p {
  margin: 6px 0 0;

  color: #949ba4;
  font-size: 14px;
}

/* Cards */

.card {
  background: #111317;

  border: 1px solid #20242b;

  border-radius: 14px;

  margin-bottom: 14px;

  overflow: hidden;

  box-shadow:
    0 10px 35px rgba(0,0,0,.25);
}

/* App */

.app-card {
  padding: 22px;
}

.label {
  color: #949ba4;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: .8px;

  margin-bottom: 15px;
}

.app-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.app-icon {
  width: 55px;
  height: 55px;

  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 27px;

  background: #1b1e24;

  border: 1px solid #292d35;
}

.app-name {
  font-size: 22px;
  font-weight: 650;
}

.live {
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

  box-shadow: 0 0 8px rgba(35,165,89,.6);
}

/* Music */

.music-card {
  padding: 22px;
}

.music-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 18px;
}

.music-status {
  color: #8d939c;

  font-size: 13px;
}

.music-status.playing {
  color: #23a559;
}

.music-row {
  display: flex;
  align-items: center;

  gap: 16px;
}

.album-art {
  width: 70px;
  height: 70px;

  flex-shrink: 0;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 30px;

  background:
    linear-gradient(
      135deg,
      #5865f2,
      #8c52ff
    );

  box-shadow:
    0 8px 25px rgba(0,0,0,.35);
}

.song {
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
}

.album {
  margin-top: 3px;

  color: #6f747c;

  font-size: 12px;
}

/* Not playing */

.not-playing {
  display: flex;
  align-items: center;

  gap: 15px;

  color: #949ba4;

  font-size: 16px;
}

.not-playing-icon {
  width: 55px;
  height: 55px;

  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #1b1e24;

  font-size: 25px;
}

/* Footer */

.footer {
  text-align: center;

  color: #555b64;

  font-size: 11px;

  margin-top: 20px;
}

/* Mobile */

@media (max-width: 500px) {

  body {
    padding: 25px 13px;
  }

  .header h1 {
    font-size: 24px;
  }

  .app-card,
  .music-card {
    padding: 18px;
  }

  .app-name {
    font-size: 20px;
  }

}

</style>

</head>

<body>

<div class="dashboard">

  <div class="header">

    <h1>iPhone Status</h1>

    <p>Live activity dashboard</p>

  </div>


  <!-- CURRENT APP -->

  <div class="card app-card">

    <div class="label">
      Currently Using
    </div>

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

        <div class="live">

          <span class="dot"></span>

          Active

        </div>

      </div>

    </div>

  </div>


  <!-- MUSIC -->

  <div class="card music-card">

    <div class="music-header">

      <div class="label" style="margin:0">
        Music
      </div>

      <div
        class="music-status"
        id="musicStatus"
      >
        Not playing
      </div>

    </div>


    <div id="musicContent">

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

function getAppIcon(name) {

  if (!name) return "📱";

  const app = name.toLowerCase();

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


async function updateStatus() {

  try {

    const response =
      await fetch("/api/status");

    const data =
      await response.json();


    // App

    const appName =
      data.currentApp || "Unknown";

    document.getElementById("appName")
      .textContent = appName;

    document.getElementById("appIcon")
      .textContent = getAppIcon(appName);


    // Music

    const music =
      data.nowPlaying || {};

    const content =
      document.getElementById("musicContent");

    const musicStatus =
      document.getElementById("musicStatus");


    if (music.title) {

      musicStatus.textContent =
        "Playing";

      musicStatus.classList.add("playing");


      content.innerHTML = \`
        <div class="music-row">

          <div class="album-art">
            🎵
          </div>

          <div style="min-width:0">

            <div class="song">
              \${escapeHtml(music.title)}
            </div>

            <div class="artist">
              \${escapeHtml(music.artist || "Unknown artist")}
            </div>

            <div class="album">
              \${escapeHtml(music.album || "")}
            </div>

          </div>

        </div>
      \`;

    } else {

      musicStatus.textContent =
        "Not playing";

      musicStatus.classList.remove("playing");


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

  } catch (error) {

    console.log(
      "Status update failed:",
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


updateStatus();

setInterval(
  updateStatus,
  3000
);

</script>

</body>

</html>
  `);
});


// ─────────────────────────────
// Start server
// ─────────────────────────────

const PORT =
  process.env.PORT || 10000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "Status server running on port " + PORT
    );
  }
);