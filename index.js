const cors = require('cors')
const express = require("express");
const app = express();
const fs = require("fs");
// const got = require('got')
const ufs = require("url-file-size");

app.use(cors({
  origin: '*'
}));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video/:id", function (req, res) {
  // Ensure there is a range given for the video
  const videoID = req.params.id;
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)

  const videoPath = `../server/media/videos/${videoID}.mp4`;
  const videoSize = fs.statSync(videoPath).size;
  // const videoSize = getVideoSize('http://localhost:8000/media/videos/9.mp4');

  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(5000, function () {
  console.log("Listening on port 5000!");
});