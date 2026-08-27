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
  const { title,} = req.body;

  nowPlaying = {
    title: title || null,
  };

  res.json({
    ok: true,
    nowPlaying
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
