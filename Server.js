const express = require("express");

const app = express();
app.use(express.json());

let nowPlaying = {
  title: null,
  artist: null,
  album: null
};

app.get("/", (req, res) => {
  res.json({
    status: "online",
    nowPlaying
  });
});

app.post("/now-playing", (req, res) => {
  const { title, artist, album } = req.body;

  nowPlaying = {
    title: title || null,
    artist: artist || null,
    album: album || null
  };

  res.json({
    ok: true,
    nowPlaying
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on ${PORT}`);
});
