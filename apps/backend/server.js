import express from "express";
import mysql from "mysql";
const app = express();
import { swaggerUiServe, swaggerUiSetup } from "./swagger.js";
const port = 3000;

app.use(express.json());
app.use("/api-docs", swaggerUiServe, swaggerUiSetup);

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

/**
 * @swagger
 * /feed:
 *   get:
 *     summary: Get the 100 most recently edited playlists
 *     responses:
 *       200:
 *         description: List of playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   songs:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         artist:
 *                           type: string
 *                         link:
 *                           type: string
 *                   likes:
 *                     type: integer
 *                   dislikes:
 *                     type: integer
 *                   last_edited:
 *                     type: string
 *                     format: date-time
 */
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

/**
 * @swagger
 * /create-playlist:
 *   post:
 *     summary: Create a new playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               songs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     artist:
 *                       type: string
 *                     link:
 *                       type: string
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 playlistId:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /delete-playlist:
 *   post:
 *     summary: Delete an existing playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playlistId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Playlist deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedPlaylistName:
 *                   type: string
 *       400:
 *         description: Missing playlistId
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Server error
 */
app.post("/delete-playlist", (req, res) => {
  const { playlistId } = req.body;

  if (!playlistId) {
    return res.status(400).json({ error: "playlistId is required" });
  }

  const selectQuery = "SELECT name FROM playlists WHERE id = ?";
  db.query(selectQuery, [playlistId], (err, results) => {
    if (err) {
      console.error("Error fetching playlist:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const playlistName = results[0].name;

    const deleteQuery = "DELETE FROM playlists WHERE id = ?";
    db.query(deleteQuery, [playlistId], (err, result) => {
      if (err) {
        console.error("Error deleting playlist:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(200).json({
        message: "Playlist deleted successfully",
        deletedPlaylistName: playlistName,
      });
    });
  });
});

/**
 * @swagger
 * /search-songs:
 *   get:
 *     summary: Search songs using iTunes API
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search string (song title or artist)
 *     responses:
 *       200:
 *         description: List of top 5 matching songs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   link:
 *                     type: string
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Server error
 */
app.get("/search-songs", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=5`;
    const response = await fetch(itunesUrl);
    const data = await response.json();

    const songs = data.results.map((song) => ({
      title: song.trackName,
      artist: song.artistName,
      link: song.previewUrl || null,
    }));

    res.status(200).json(songs);
  } catch (err) {
    console.error("Error fetching songs from iTunes:", err);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

/**
 * @swagger
 * /add-song:
 *   post:
 *     summary: Add a song to an existing playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playlistId:
 *                 type: integer
 *               song:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   link:
 *                     type: string
 *     responses:
 *       200:
 *         description: Song added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 songs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       artist:
 *                         type: string
 *                       link:
 *                         type: string
 *       400:
 *         description: Invalid input or duplicate song
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Server error
 */
app.post("/add-song", (req, res) => {
  const { playlistId, song } = req.body;

  if (!playlistId || !song || !song.title || !song.artist) {
    return res.status(400).json({
      error: "playlistId and song with title and artist are required",
    });
  }

  const selectQuery = "SELECT songs FROM playlists WHERE id = ?";
  db.query(selectQuery, [playlistId], (err, results) => {
    if (err) {
      console.error("Error fetching playlist:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    let songs = [];
    try {
      songs = JSON.parse(results[0].songs);
    } catch (parseErr) {
      console.error("Error parsing songs JSON:", parseErr);
      return res.status(500).json({ error: "Failed to parse playlist songs" });
    }

    const duplicate = songs.find(
      (s) => s.title === song.title && s.artist === song.artist
    );

    if (duplicate) {
      return res.status(400).json({
        error:
          "Song with the same title and artist already exists in the playlist",
      });
    }

    songs.push(song);

    const updateQuery = `
      UPDATE playlists
      SET songs = ?, last_edited = NOW()
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [JSON.stringify(songs), playlistId],
      (err, updateResult) => {
        if (err) {
          console.error("Error updating playlist:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.status(200).json({ message: "Song added successfully", songs });
      }
    );
  });
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
