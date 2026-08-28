const express = require("express");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));


// ═════════════════════════════════════════════
// STATUS
// ═════════════════════════════════════════════

let status = {
  currentApp: "Unknown",
  appOpenedAt: null,

  online: true,
  lastSeen: Date.now(),

  focusMode: {
    name: "No Focus Mode",
    icon: "🌙",
    description:
      "Notifications and alerts work normally."
  },

  nowPlaying: {
    title: null,
    artist: null,
    album: null,
    albumCover: null
  }
};


// ═════════════════════════════════════════════
// ONLINE TIMEOUT
// 1 HOUR
// ═════════════════════════════════════════════

const ONLINE_TIMEOUT =
  60 * 60 * 1000;


// ═════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════

function clean(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const text =
    String(value).trim();

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
// API
// ═════════════════════════════════════════════

app.get("/api/status", (req, res) => {

  const elapsed =
    Date.now() - status.lastSeen;

  status.online =
    elapsed < ONLINE_TIMEOUT;

  res.json(status);

});


// ═════════════════════════════════════════════
// CURRENT APP
// ═════════════════════════════════════════════

app.post("/app", (req, res) => {

  console.log("App update:", req.body);

  const appName =
    clean(req.body?.app) ||
    clean(req.body?.name) ||
    clean(req.body?.application) ||
    clean(req.body?.text);

  if (!appName) {

    return res.status(400).json({
      ok: false,
      error: "No app name received."
    });

  }

  if (
    status.currentApp !== appName
  ) {

    status.currentApp =
      appName;

    status.appOpenedAt =
      Date.now();

  }

  status.lastSeen =
    Date.now();

  status.online =
    true;

  res.json({
    ok: true,
    status
  });

});


// ═════════════════════════════════════════════
// HEARTBEAT
// ═════════════════════════════════════════════

app.post("/heartbeat", (req, res) => {

  status.lastSeen =
    Date.now();

  status.online =
    true;

  res.json({
    ok: true,
    online: true
  });

});


// ═════════════════════════════════════════════
// MUSIC
// ═════════════════════════════════════════════

app.post("/now-playing", (req, res) => {

  console.log(
    "Music update:",
    req.body
  );

  status.nowPlaying = {

    title:
      clean(req.body?.title),

    artist:
      clean(req.body?.artist),

    album:
      clean(req.body?.album),

    albumCover:
      clean(req.body?.albumCover) ||
      clean(req.body?.cover) ||
      clean(req.body?.artwork)

  };

  status.lastSeen =
    Date.now();

  status.online =
    true;

  res.json({
    ok: true,
    nowPlaying:
      status.nowPlaying
  });

});


// ═════════════════════════════════════════════
// CLEAR MUSIC
// ═════════════════════════════════════════════

app.post(
  "/now-playing/clear",
  (req, res) => {

    status.nowPlaying = {

      title: null,
      artist: null,
      album: null,
      albumCover: null

    };

    status.lastSeen =
      Date.now();

    status.online =
      true;

    res.json({
      ok: true
    });

  }
);


// ═════════════════════════════════════════════
// FOCUS MODE
// ═════════════════════════════════════════════

app.post("/focus", (req, res) => {

  console.log(
    "Focus update:",
    req.body
  );

  const name =
    clean(req.body?.name) ||
    "No Focus Mode";

  const icon =
    clean(req.body?.icon) ||
    "🌙";

  let description =
    clean(req.body?.description);

  if (!description) {

    const focus =
      name.toLowerCase();

    if (
      focus.includes("do not disturb")
    ) {

      description =
        "Silences calls, alerts and notifications so you can focus without interruptions.";

    }

    else if (
      focus.includes("sleep")
    ) {

      description =
        "Helps you wind down and limits notifications during your scheduled sleep time.";

    }

    else if (
      focus.includes("work")
    ) {

      description =
        "Helps you concentrate on work by allowing only the notifications and people you choose.";

    }

    else if (
      focus.includes("personal")
    ) {

      description =
        "Lets you focus on personal time while filtering notifications you don't want.";

    }

    else if (
      focus.includes("fitness")
    ) {

      description =
        "Helps you stay focused during workouts by filtering distracting notifications.";

    }

    else {

      description =
        "Notifications are filtered according to this Focus Mode.";

    }

  }

  status.focusMode = {
    name,
    icon,
    description
  };

  status.lastSeen =
    Date.now();

  status.online =
    true;

  res.json({
    ok: true,
    focusMode:
      status.focusMode
  });

});


// ═════════════════════════════════════════════
// CLEAR FOCUS
// ═════════════════════════════════════════════

app.post("/focus/clear", (req, res) => {

  status.focusMode = {

    name:
      "No Focus Mode",

    icon:
      "🌙",

    description:
      "Notifications and alerts work normally."

  };

  status.lastSeen =
    Date.now();

  status.online =
    true;

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
  content="#050008"
>

<title>iPhone Status</title>


<style>

/* ═══════════════════════════════════════════
   GLOBAL
═══════════════════════════════════════════ */

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {

  background:

    radial-gradient(
      circle at 50% -10%,
      rgba(142, 45, 226, .22),
      transparent 38%
    ),

    radial-gradient(
      circle at 0% 100%,
      rgba(91, 33, 182, .12),
      transparent 35%
    ),

    #050008;

  color: #ffffff;

  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;

  padding:
    35px 16px 55px;

}


/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */

.dashboard {

  width: 100%;

  max-width: 700px;

  margin: auto;

}


/* ═══════════════════════════════════════════
   DOUBLE STROKE TEXT
═══════════════════════════════════════════ */

.stroke-text {

  color: #ffffff;

  -webkit-text-stroke:
    1px #9b4dff;

  text-shadow:

    0 0 2px #000000,

    0 0 7px rgba(168, 85, 247, .9),

    0 0 16px rgba(126, 34, 206, .55);

}


/* ═══════════════════════════════════════════
   HEADER
═══════════════════════════════════════════ */

.header {

  display: flex;

  align-items: center;

  gap: 15px;

  margin-bottom: 22px;

}

.header-icon {

  width: 50px;
  height: 50px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background:

    linear-gradient(
      145deg,
      #170024,
      #3b0764
    );

  border:
    1px solid #7e22ce;

  box-shadow:

    0 0 20px
    rgba(126,34,206,.45),

    inset 0 0 15px
    rgba(168,85,247,.15);

  font-size: 24px;

}

.header h1 {

  margin: 0;

  font-size: 25px;

  font-weight: 800;

  letter-spacing: -.5px;

}

.header p {

  margin: 4px 0 0;

  color: #a78bfa;

  font-size: 12px;

}


/* ═══════════════════════════════════════════
   CARDS
═══════════════════════════════════════════ */

.card {

  position: relative;

  background:
    linear-gradient(
      145deg,
      rgba(16, 5, 23, .98),
      rgba(7, 2, 10, .98)
    );

  border:
    1px solid #351052;

  border-radius: 17px;

  margin-bottom: 15px;

  overflow: hidden;

  box-shadow:

    0 10px 35px
    rgba(0,0,0,.55),

    0 0 20px
    rgba(126,34,206,.07);

  transition:
    .2s ease;

}

.card:hover {

  border-color:
    #6d28d9;

  box-shadow:

    0 10px 35px
    rgba(0,0,0,.65),

    0 0 25px
    rgba(126,34,206,.16);

}


/* ═══════════════════════════════════════════
   CARD HEADER
═══════════════════════════════════════════ */

.card-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    19px 21px 0;

}

.card-title {

  color: #c084fc;

  font-size: 10px;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 1.3px;

}


/* ═══════════════════════════════════════════
   ONLINE
═══════════════════════════════════════════ */

.profile {

  padding:
    20px 21px;

  display: flex;

  align-items: center;

  gap: 15px;

}

.profile-picture {

  width: 68px;
  height: 68px;

  border-radius: 50%;

  object-fit: cover;

  border:
    3px solid #a855f7;

  box-shadow:

    0 0 12px
    rgba(168,85,247,.8),

    0 0 25px
    rgba(126,34,206,.4);

  transition:
    .25s ease;

}

.profile-picture.offline {

  border-color:
    #4b5563;

  box-shadow:
    none;

  filter:
    grayscale(.7);

}

.username {

  font-size: 21px;

  font-weight: 800;

  color: #ffffff;

  -webkit-text-stroke:
    .5px #9333ea;

  text-shadow:
    0 0 9px
    rgba(168,85,247,.65);

}

.online {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 5px;

  color: #c4b5fd;

  font-size: 12px;

}

.dot {

  width: 8px;
  height: 8px;

  border-radius: 50%;

  background:
    #c084fc;

  box-shadow:
    0 0 10px
    #a855f7;

}

.dot.offline {

  background:
    #4b5563;

  box-shadow:
    none;

}


/* ═══════════════════════════════════════════
   APP
═══════════════════════════════════════════ */

.app-content {

  padding:
    18px 21px 21px;

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

  background:

    linear-gradient(
      145deg,
      #160020,
      #26003b
    );

  border:
    1px solid #6d28d9;

  box-shadow:

    inset 0 0 15px
    rgba(168,85,247,.1),

    0 0 15px
    rgba(126,34,206,.15);

  font-size: 27px;

}

.app-name {

  font-size: 21px;

  font-weight: 800;

  color: #ffffff;

  -webkit-text-stroke:
    .7px #a855f7;

  text-shadow:

    0 0 3px #000,

    0 0 10px
    rgba(168,85,247,.75);

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

  border-top:
    1px solid #2b123d;

}

.timer-label {

  color: #8b5cf6;

  font-size: 12px;

  font-weight: 600;

}

.timer-value {

  color: #ffffff;

  font-size: 14px;

  font-weight: 800;

  font-variant-numeric:
    tabular-nums;

  -webkit-text-stroke:
    .4px #a855f7;

  text-shadow:
    0 0 8px
    rgba(168,85,247,.65);

}


/* ═══════════════════════════════════════════
   MUSIC
═══════════════════════════════════════════ */

.music-content {

  padding:
    18px 21px 21px;

}

.music-status {

  color:
    #8b5cf6;

  font-size: 12px;

  font-weight: 700;

}

.music-status.playing {

  color:
    #c084fc;

  text-shadow:
    0 0 9px
    rgba(192,132,252,.75);

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

  border-radius: 12px;

  object-fit: cover;

  background:

    linear-gradient(
      135deg,
      #581c87,
      #a855f7
    );

  border:
    1px solid #9333ea;

  box-shadow:

    0 0 15px
    rgba(168,85,247,.3);

}

.music-info {

  min-width: 0;

}

.song {

  color: #ffffff;

  font-size: 19px;

  font-weight: 800;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

  -webkit-text-stroke:
    .6px #a855f7;

  text-shadow:

    0 0 3px #000,

    0 0 9px
    rgba(168,85,247,.65);

}

.artist {

  margin-top: 4px;

  color: #c4b5fd;

  font-size: 14px;

}

.album {

  margin-top: 4px;

  color: #7c3aed;

  font-size: 12px;

}


/* ═══════════════════════════════════════════
   NOT PLAYING
═══════════════════════════════════════════ */

.not-playing {

  display: flex;

  align-items: center;

  gap: 15px;

  color: #a78bfa;

  font-size: 15px;

}

.not-playing-icon {

  width: 58px;
  height: 58px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background:
    #120019;

  border:
    1px solid #4c1d95;

  box-shadow:
    inset 0 0 15px
    rgba(168,85,247,.08);

  font-size: 25px;

}


/* ═══════════════════════════════════════════
   FOCUS MODE
═══════════════════════════════════════════ */

.focus-content {

  padding:
    18px 21px 21px;

}

.focus-row {

  display: flex;

  align-items: center;

  gap: 15px;

}

.focus-icon {

  width: 58px;
  height: 58px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background:

    linear-gradient(
      145deg,
      #160020,
      #29003d
    );

  border:
    1px solid #7e22ce;

  box-shadow:
    0 0 15px
    rgba(126,34,206,.2);

  font-size: 26px;

}

.focus-info {

  min-width: 0;

}

.focus-name {

  color: #ffffff;

  font-size: 18px;

  font-weight: 800;

  -webkit-text-stroke:
    .6px #a855f7;

  text-shadow:

    0 0 3px #000,

    0 0 9px
    rgba(168,85,247,.65);

}

.focus-description {

  margin-top: 5px;

  color: #a78bfa;

  font-size: 12px;

  line-height: 1.45;

  max-width: 520px;

}


/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */

.footer {

  text-align: center;

  margin-top: 20px;

  color: #6d28d9;

  font-size: 10px;

  letter-spacing: .5px;

}


/* ═══════════════════════════════════════════
   MOBILE
═══════════════════════════════════════════ */

@media (max-width: 500px) {

  body {

    padding:
      25px 12px 40px;

  }

  .header h1 {

    font-size: 23px;

  }

  .profile {

    padding:
      18px;

  }

  .profile-picture {

    width: 60px;
    height: 60px;

  }

  .card-header {

    padding:
      17px 18px 0;

  }

  .app-content,
  .music-content,
  .focus-content {

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


/* ═══════════════════════════════════════════
   PURPLE SCROLLBAR
═══════════════════════════════════════════ */

::-webkit-scrollbar {

  width: 7px;

}

::-webkit-scrollbar-track {

  background:
    #050008;

}

::-webkit-scrollbar-thumb {

  background:
    #581c87;

  border-radius:
    10px;

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


  <!-- ONLINE -->

  <div class="card">

    <div class="profile">

      <img
        id="profilePicture"
        class="profile-picture"
        src="/online.jpg"
        alt="Status"
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


  <!-- FOCUS MODE -->

  <div class="card">

    <div class="card-header">

      <div class="card-title">
        Focus Mode
      </div>

    </div>


    <div class="focus-content">

      <div class="focus-row">

        <div
          class="focus-icon"
          id="focusIcon"
        >
          🌙
        </div>


        <div class="focus-info">

          <div
            class="focus-name"
            id="focusName"
          >
            No Focus Mode
          </div>


          <div
            class="focus-description"
            id="focusDescription"
          >
            Notifications and alerts
            work normally.
          </div>

        </div>

      </div>

    </div>

  </div>


  <div class="footer">
    iPhone • Live Status
  </div>


</div>


<script>


// ═══════════════════════════════════════════
// APP ICONS
// ═══════════════════════════════════════════

function getAppIcon(name) {

  if (!name)
    return "📱";

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
// STATUS UPDATE
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


    // ─────────────────────────────────────
    // ONLINE
    // ─────────────────────────────────────

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

    }

    else {

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


    // ─────────────────────────────────────
    // APP
    // ─────────────────────────────────────

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


    // ─────────────────────────────────────
    // MUSIC
    // ─────────────────────────────────────

    const music =
      data.nowPlaying || {};

    const musicContent =
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


      const cover =
        music.albumCover;


      const albumHTML =
        cover

        ? \`
          <img
            class="album-art"
            src="\${escapeHtml(cover)}"
            alt="Album cover"
          >
        \`

        : \`
          <div class="album-art"
               style="
                 display:flex;
                 align-items:center;
                 justify-content:center;
                 font-size:30px;
               ">
            🎵
          </div>
        \`;


      musicContent.innerHTML = \`

        <div class="music-row">

          \${albumHTML}

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


      musicContent.innerHTML = \`

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


    // ─────────────────────────────────────
    // FOCUS
    // ─────────────────────────────────────

    const focus =
      data.focusMode || {};


    document
      .getElementById("focusName")
      .textContent =

        focus.name ||
        "No Focus Mode";


    document
      .getElementById("focusIcon")
      .textContent =

        focus.icon ||
        "🌙";


    document
      .getElementById("focusDescription")
      .textContent =

        focus.description ||

        "Notifications and alerts work normally.";

  }


  catch (error) {

    console.log(
      "Status update failed:",
      error
    );

  }

}


// ═══════════════════════════════════════════
// ESCAPE HTML
// ═══════════════════════════════════════════

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