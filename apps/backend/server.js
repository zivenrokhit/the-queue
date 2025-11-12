import express from "express";
import mysql from "mysql";
const app = express();
const port = 3000;

app.use(express.json());

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "the_queue_db",
});

db.connect((err) => {
  if (err) {
    console.error("ERROR: Error connecting to MySQL:", err);
    return;
  }
  console.log("SUCCESS: Connected to MySQL database");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/feed", (req, res) => {
  const query = `
    SELECT id, name, songs, likes, dislikes, last_edited
    FROM playlists
    ORDER BY last_edited DESC
    LIMIT 100
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching feed:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const feed = results.map((playlist) => ({
      ...playlist,
      songs: JSON.parse(playlist.songs),
    }));

    res.status(200).json(feed);
  });
});

app.post("/like", (req, res) => {
  res.send("Hello World!");
});

app.post("/dislike", (req, res) => {
  res.send("Hello World!");
});

app.post("/create-playlist", (req, res) => {
  const { name, songs } = req.body;

  if (!name || !songs || !Array.isArray(songs)) {
    return res
      .status(400)
      .json({ error: "Invalid input: name and songs array are required." });
  }

  const songsJSON = JSON.stringify(songs);

  const query = `
    INSERT INTO playlists (name, songs, last_edited)
    VALUES (?, ?, NOW())
  `;

  db.query(query, [name, songsJSON], (err, result) => {
    if (err) {
      console.error("ERROR: Error creating playlist:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      message: "Playlist created successfully",
      playlistId: result.insertId,
    });
  });
});

app.post("/modify-playlist", (req, res) => {
  res.send("Hello World!");
});

app.post("/delete-playlist", (req, res) => {
  res.send("Hello World!");
});

app.post("/publish-playlist", (req, res) => {
  res.send("Hello World!");
});

app.post("/add-song", (req, res) => {
  res.send("Hello World!");
});

// TODO: Let's treat auth feature as a 'nice to have' we only add if time permits

// app.post("/login", (req, res) => {
//   res.send("Hello World!");
// });

// app.post("/signup", (req, res) => {
//   res.send("Hello World!");
// });

app.listen(port, () => {
  console.log(`The Queue listening on port ${port}`);
});
