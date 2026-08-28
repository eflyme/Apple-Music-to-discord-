const express = require("express");

const app = express();

app.use(express.json({ limit: "5mb" }));


// ═══════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════

let status = {

  currentApp: null,

  appOpenedAt: null,

  lastSeen: null,

  nowPlaying: {

    title: null,
    artist: null,
    album: null,
    albumCover: null

  },

  focusMode: null

};


// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════

const ONLINE_TIMEOUT =
  60 * 60 * 1000;


// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

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


// ═══════════════════════════════════════════
// API — STATUS
// ═══════════════════════════════════════════

app.get("/api/status", (req, res) => {

  let online = false;


  if (status.lastSeen) {

    online =
      Date.now() -
      status.lastSeen <
      ONLINE_TIMEOUT;

  }


  res.json({

    ...status,

    online

  });

});


// ═══════════════════════════════════════════
// API — APP
// ═══════════════════════════════════════════

app.post("/app", (req, res) => {

  const appName =

    clean(req.body?.app) ||

    clean(req.body?.name) ||

    clean(req.body?.application);


  if (!appName) {

    return res.status(400).json({

      ok: false,

      error:
        "No app name received."

    });

  }


  if (
    status.currentApp !==
    appName
  ) {

    status.currentApp =
      appName;

    status.appOpenedAt =
      Date.now();

  }


  status.lastSeen =
    Date.now();


  res.json({

    ok: true,

    status

  });

});


// ═══════════════════════════════════════════
// API — CLEAR APP
// ═══════════════════════════════════════════

app.post("/app/clear", (req, res) => {

  status.currentApp = null;

  status.appOpenedAt = null;

  status.lastSeen =
    Date.now();


  res.json({

    ok: true

  });

});


// ═══════════════════════════════════════════
// API — HEARTBEAT
// ═══════════════════════════════════════════

app.post("/heartbeat", (req, res) => {

  status.lastSeen =
    Date.now();


  res.json({

    ok: true

  });

});


// ═══════════════════════════════════════════
// API — MUSIC
// ═══════════════════════════════════════════

app.post("/now-playing", (req, res) => {

  const title =
    clean(req.body?.title);

  const artist =
    clean(req.body?.artist);

  const album =
    clean(req.body?.album);

  const albumCover =

    clean(req.body?.albumCover) ||

    clean(req.body?.cover) ||

    clean(req.body?.artwork);


  if (
    !title &&
    !artist &&
    !album &&
    !albumCover
  ) {

    status.nowPlaying = {

      title: null,

      artist: null,

      album: null,

      albumCover: null

    };

  }

  else {

    status.nowPlaying = {

      title,

      artist,

      album,

      albumCover

    };

  }


  status.lastSeen =
    Date.now();


  res.json({

    ok: true,

    nowPlaying:
      status.nowPlaying

  });

});


// ═══════════════════════════════════════════
// API — CLEAR MUSIC
// ═══════════════════════════════════════════

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


    res.json({

      ok: true

    });

  }
);


// ═══════════════════════════════════════════
// API — FOCUS
// ═══════════════════════════════════════════

app.post("/focus", (req, res) => {

  const name =
    clean(req.body?.name);

  const icon =
    clean(req.body?.icon) ||
    "🌙";

  const description =
    clean(req.body?.description);


  if (
    !name ||
    name.toLowerCase() ===
      "no focus mode"
  ) {

    status.focusMode =
      null;

  }

  else {

    status.focusMode = {

      name,

      icon,

      description:

        description ||

        "Notifications are filtered according to this Focus Mode."

    };

  }


  status.lastSeen =
    Date.now();


  res.json({

    ok: true,

    focusMode:
      status.focusMode

  });

});


// ═══════════════════════════════════════════
// API — CLEAR FOCUS
// ═══════════════════════════════════════════

app.post("/focus/clear", (req, res) => {

  status.focusMode = null;

  status.lastSeen =
    Date.now();


  res.json({

    ok: true

  });

});


// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════

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
  content="#000000"
>

<title>iPhone Status</title>


<style>

/* ═══════════════════════════════════════
   VOID
═══════════════════════════════════════ */

* {

  box-sizing: border-box;

}


html,
body {

  margin: 0;

  min-height: 100%;

  background: #000000;

}


body {

  background: #000000;

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
    30px 14px 50px;

}


/* ═══════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════ */

.dashboard {

  width: 100%;

  max-width: 700px;

  margin: auto;

}


/* ═══════════════════════════════════════
   HEADER
═══════════════════════════════════════ */

.header {

  margin-bottom: 20px;

}


.header h1 {

  margin: 0;

  font-size: 27px;

  font-weight: 900;

  color: #ffffff;

  -webkit-text-stroke:
    0.8px #a855f7;

  text-shadow:

    0 0 3px #000000,

    0 0 10px
    rgba(168,85,247,.75);

}


.header p {

  margin:
    5px 0 0;

  color: #7c3aed;

  font-size: 12px;

}


/* ═══════════════════════════════════════
   CARDS
═══════════════════════════════════════ */

.card {

  display: none;

  position: relative;

  margin-bottom: 15px;

  background: #020202;

  border:
    1px solid #35104f;

  border-radius: 17px;

  overflow: hidden;


  /*
     VERY SMALL OUTER GLOW
     + STRONG INNER GLOW
  */

  box-shadow:

    0 0 6px
    rgba(168,85,247,.08),

    inset 0 0 12px
    rgba(168,85,247,.20),

    inset 0 0 30px
    rgba(126,34,206,.14),

    inset 0 0 65px
    rgba(88,28,135,.08);

}


.card.visible {

  display: block;

}


/* Inner edge */

.card::after {

  content: "";

  position: absolute;

  inset: 0;

  pointer-events: none;

  border-radius: inherit;

  box-shadow:

    inset 0 0 3px
    rgba(216,180,254,.30),

    inset 0 0 20px
    rgba(168,85,247,.10);

}


/* ═══════════════════════════════════════
   CARD HEADER
═══════════════════════════════════════ */

.card-header {

  padding:
    18px 20px 0;

  display: flex;

  align-items: center;

  justify-content:
    space-between;

}


.label {

  color: #a855f7;

  font-size: 10px;

  font-weight: 900;

  letter-spacing: 1.5px;

  text-transform: uppercase;

  text-shadow:

    0 0 7px
    rgba(168,85,247,.60);

}


/* ═══════════════════════════════════════
   ONLINE
═══════════════════════════════════════ */

.profile {

  padding: 20px;

}


.profile-name {

  color: #ffffff;

  font-size: 22px;

  font-weight: 900;

  -webkit-text-stroke:
    .7px #a855f7;

  text-shadow:

    0 0 3px #000000,

    0 0 10px
    rgba(168,85,247,.75);

}


.online {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 6px;

  color: #c4b5fd;

  font-size: 12px;

}


.dot {

  width: 8px;

  height: 8px;

  border-radius: 50%;

  background: #c084fc;

  box-shadow:

    0 0 7px
    #a855f7;

}


/* ═══════════════════════════════════════
   APP
═══════════════════════════════════════ */

.app-content {

  padding:
    17px 20px 20px;

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

  background: #010101;

  border:
    1px solid #5b21b6;

  box-shadow:

    inset 0 0 15px
    rgba(168,85,247,.25),

    inset 0 0 32px
    rgba(126,34,206,.15),

    0 0 4px
    rgba(168,85,247,.08);

  font-size: 27px;

}


.app-name {

  color: #ffffff;

  font-size: 21px;

  font-weight: 900;

  -webkit-text-stroke:
    .7px #a855f7;

  text-shadow:

    0 0 3px #000000,

    0 0 9px
    rgba(168,85,247,.75);

}


/* ═══════════════════════════════════════
   TIMER
═══════════════════════════════════════ */

.timer {

  display: flex;

  justify-content:
    space-between;

  margin-top: 17px;

  padding-top: 13px;

  border-top:
    1px solid #24102f;

}


.timer-label {

  color: #7c3aed;

  font-size: 12px;

}


.timer-value {

  color: #ffffff;

  font-size: 14px;

  font-weight: 900;

  font-variant-numeric:
    tabular-nums;

  -webkit-text-stroke:
    .4px #a855f7;

  text-shadow:

    0 0 7px
    rgba(168,85,247,.65);

}


/* ═══════════════════════════════════════
   MUSIC
═══════════════════════════════════════ */

.music-content {

  padding:
    17px 20px 20px;

}


.music-status {

  color: #7c3aed;

  font-size: 12px;

  font-weight: 700;

}


.music-status.playing {

  color: #c084fc;

  text-shadow:

    0 0 8px
    rgba(192,132,252,.8);

}


.music-row {

  display: flex;

  align-items: center;

  gap: 15px;

}


.album-art {

  width: 78px;

  height: 78px;

  flex-shrink: 0;

  object-fit: cover;

  border-radius: 12px;

  background: #010101;

  border:
    1px solid #7e22ce;

  box-shadow:

    inset 0 0 15px
    rgba(168,85,247,.22),

    inset 0 0 35px
    rgba(126,34,206,.12),

    0 0 4px
    rgba(168,85,247,.08);

}


.music-info {

  min-width: 0;

}


.song {

  color: #ffffff;

  font-size: 19px;

  font-weight: 900;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

  -webkit-text-stroke:
    .6px #a855f7;

  text-shadow:

    0 0 3px #000000,

    0 0 9px
    rgba(168,85,247,.7);

}


.artist {

  margin-top: 4px;

  color: #c4b5fd;

  font-size: 14px;

}


.album {

  margin-top: 3px;

  color: #7c3aed;

  font-size: 12px;

}


/* ═══════════════════════════════════════
   FOCUS
═══════════════════════════════════════ */

.focus-content {

  padding:
    17px 20px 20px;

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

  background: #010101;

  border:
    1px solid #6d28d9;

  box-shadow:

    inset 0 0 15px
    rgba(168,85,247,.22),

    inset 0 0 32px
    rgba(126,34,206,.13);

  font-size: 26px;

}


.focus-name {

  color: #ffffff;

  font-size: 18px;

  font-weight: 900;

  -webkit-text-stroke:
    .6px #a855f7;

  text-shadow:

    0 0 3px #000000,

    0 0 9px
    rgba(168,85,247,.7);

}


.focus-description {

  margin-top: 5px;

  color: #a78bfa;

  font-size: 12px;

  line-height: 1.45;

}


/* ═══════════════════════════════════════
   FOOTER
═══════════════════════════════════════ */

.footer {

  margin-top: 18px;

  text-align: center;

  color: #3b1255;

  font-size: 10px;

}


/* ═══════════════════════════════════════
   MOBILE
═══════════════════════════════════════ */

@media (max-width: 500px) {

  body {

    padding:
      23px 12px 40px;

  }


  .header h1 {

    font-size: 23px;

  }


  .profile {

    padding: 18px;

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

}

</style>

</head>


<body>


<div class="dashboard">


  <!-- HEADER -->

  <div class="header">

    <h1>
      iPhone Status
    </h1>

    <p>
      Live activity dashboard
    </p>

  </div>


  <!-- ONLINE -->

  <div
    class="card"
    id="onlineCard"
  >

    <div class="profile">

      <div class="profile-name">
        iPhone
      </div>

      <div class="online">

        <span class="dot"></span>

        <span>
          Online
        </span>

      </div>

    </div>

  </div>


  <!-- CURRENT APP -->

  <div
    class="card"
    id="appCard"
  >

    <div class="card-header">

      <div class="label">
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
          ></div>

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

  <div
    class="card"
    id="musicCard"
  >

    <div class="card-header">

      <div class="label">
        Music
      </div>


      <div
        class="music-status playing"
        id="musicStatus"
      >
        Playing
      </div>

    </div>


    <div
      class="music-content"
      id="musicContent"
    ></div>

  </div>


  <!-- FOCUS -->

  <div
    class="card"
    id="focusCard"
  >

    <div class="card-header">

      <div class="label">
        Focus Mode
      </div>

    </div>


    <div class="focus-content">

      <div class="focus-row">

        <div
          class="focus-icon"
          id="focusIcon"
        ></div>


        <div>

          <div
            class="focus-name"
            id="focusName"
          ></div>


          <div
            class="focus-description"
            id="focusDescription"
          ></div>

        </div>

      </div>

    </div>

  </div>


  <div class="footer">
    Live iPhone Status
  </div>


</div>


<script>


// ═══════════════════════════════════════
// APP ICONS
// ═══════════════════════════════════════

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


// ═══════════════════════════════════════
// TIMER
// ═══════════════════════════════════════

let appOpenedAt = null;


function updateTimer() {

  const timer =
    document.getElementById(
      "timer"
    );


  if (!appOpenedAt) {

    timer.textContent =
      "00:00:00";

    return;

  }


  const elapsed =

    Math.max(
      0,

      Math.floor(

        (
          Date.now() -
          appOpenedAt

        ) / 1000

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


// ═══════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════

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


    // ─────────────────────────────────
    // ONLINE
    // ─────────────────────────────────

    const onlineCard =
      document.getElementById(
        "onlineCard"
      );


    if (data.online) {

      onlineCard.classList.add(
        "visible"
      );

    }

    else {

      onlineCard.classList.remove(
        "visible"
      );

    }


    // ─────────────────────────────────
    // APP
    // ─────────────────────────────────

    const appCard =
      document.getElementById(
        "appCard"
      );


    if (data.currentApp) {

      appCard.classList.add(
        "visible"
      );


      document
        .getElementById(
          "appName"
        )
        .textContent =
          data.currentApp;


      document
        .getElementById(
          "appIcon"
        )
        .textContent =
          getAppIcon(
            data.currentApp
          );


      appOpenedAt =
        data.appOpenedAt;

    }

    else {

      appCard.classList.remove(
        "visible"
      );


      appOpenedAt =
        null;

    }


    // ─────────────────────────────────
    // MUSIC
    // ─────────────────────────────────

    const music =
      data.nowPlaying;


    const musicCard =
      document.getElementById(
        "musicCard"
      );


    if (

      music &&

      (
        music.title ||
        music.artist ||
        music.album ||
        music.albumCover
      )

    ) {

      musicCard.classList.add(
        "visible"
      );


      const musicStatus =
        document.getElementById(
          "musicStatus"
        );


      musicStatus.textContent =
        "Playing";


      let cover;


      if (music.albumCover) {

        cover = \`

          <img
            class="album-art"
            src="\${escapeHtml(
              music.albumCover
            )}"
            alt="Album cover"
          >

        \`;

      }

      else {

        cover = \`

          <div
            class="album-art"
            style="
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:30px;
            "
          >
            🎵
          </div>

        \`;

      }


      document
        .getElementById(
          "musicContent"
        )
        .innerHTML = \`

          <div class="music-row">

            \${cover}

            <div class="music-info">

              <div class="song">

                \${escapeHtml(
                  music.title ||
                  "Unknown song"
                )}

              </div>


              \${
                music.artist
                ? \`

                  <div class="artist">

                    \${escapeHtml(
                      music.artist
                    )}

                  </div>

                \`
                : ""
              }


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

      musicCard.classList.remove(
        "visible"
      );

    }


    // ─────────────────────────────────
    // FOCUS
    // ─────────────────────────────────

    const focus =
      data.focusMode;


    const focusCard =
      document.getElementById(
        "focusCard"
      );


    if (
      focus &&
      focus.name
    ) {

      focusCard.classList.add(
        "visible"
      );


      document
        .getElementById(
          "focusName"
        )
        .textContent =
          focus.name;


      document
        .getElementById(
          "focusIcon"
        )
        .textContent =
          focus.icon ||
          "🌙";


      document
        .getElementById(
          "focusDescription"
        )
        .textContent =
          focus.description ||
          "";

    }

    else {

      focusCard.classList.remove(
        "visible"
      );

    }

  }


  catch (error) {

    console.log(
      "Update failed:",
      error
    );

  }

}


// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════

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


// ═══════════════════════════════════════
// SERVER
// ═══════════════════════════════════════

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