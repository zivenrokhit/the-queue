import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt";
import cors from "cors";
import { swaggerUiServe, swaggerUiSetup } from "./swagger.js";
const port = 8080;

const app = express();

app.use(express.json());
app.use(cors());
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
 *                   username:
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
    SELECT
      p.playlist_id,
      p.name,
      p.songs,
      p.likes,
      p.dislikes,
      p.last_edited,
      u.username
    FROM playlists AS p
    INNER JOIN users AS u ON p.user_id = u.user_id
    ORDER BY p.last_edited DESC
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

/**
 * @swagger
 * /like:
 *   post:
 *     summary: Increments the like count for a specific playlist.
 *     description: Finds a playlist by ID and increments its 'likes' field by 1.
 *     tags:
 *       - Playlists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playlistId
 *             properties:
 *               playlistId:
 *                 type: string
 *                 description: The unique ID of the playlist to like.
 *                 example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789'
 *     responses:
 *       200:
 *         description: Success. The playlist like count was incremented.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Playlist liked successfully."
 *                 playlistId:
 *                   type: string
 *                   example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789'
 *       400:
 *         description: Bad Request. Occurs if the playlistId is missing from the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing playlistId in request body."
 *       404:
 *         description: Not Found. Occurs if no playlist with the given ID exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Playlist with ID a1b2c3d4-e5f6-7890-abcd-ef0123456789 not found."
 *       500:
 *         description: Internal Server Error. Occurs due to a database connection or query issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update playlist likes."
 */
app.post("/like", (req, res) => {
  const { playlistId } = req.body;

  if (!playlistId) {
    return res
      .status(400)
      .json({ error: "Missing playlistId in request body." });
  }

  const query = `
    UPDATE playlists
    SET likes = likes + 1
    WHERE playlist_id = ?;
  `;

  db.query(query, [playlistId], (err, results) => {
    if (err) {
      console.error("Database error while incrementing like:", err);
      return res
        .status(500)
        .json({ error: "Failed to update playlist likes." });
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: `Playlist with ID ${playlistId} not found.` });
    }

    res
      .status(200)
      .json({ message: "Playlist liked successfully.", playlistId });
  });
});

/**
 * @swagger
 * /get-my-playlists:
 *   get:
 *     summary: Get all playlists owned by a specific user
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose playlists are being fetched
 *     responses:
 *       200:
 *         description: List of user's playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playlist_id:
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
 *       400:
 *         description: Missing userId
 *       500:
 *         description: Database error
 */
app.get("/get-my-playlists", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const query = `
    SELECT playlist_id, name, songs, likes, dislikes, last_edited
    FROM playlists
    WHERE user_id = ?
    ORDER BY last_edited DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user playlists:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const playlists = results.map((playlist) => ({
      ...playlist,
      songs: JSON.parse(playlist.songs),
    }));

    res.status(200).json(playlists);
  });
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
 *               username:
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
app.post("/create-playlist", (req, res) => {
  const { name, songs, username } = req.body;

  if (!name || !songs || !Array.isArray(songs) || !username) {
    return res.status(400).json({
      error: "Name, songs array, and username are required.",
    });
  }

  const findUserQuery = "SELECT user_id FROM users WHERE username = ?";

  db.query(findUserQuery, [username], (err, userResults) => {
    if (err) {
      console.error("ERROR: Error finding user:", err);
      return res
        .status(500)
        .json({ error: "Database error while finding user" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const userId = userResults[0].user_id;
    const songsJSON = JSON.stringify(songs);

    const insertPlaylistQuery = `
      INSERT INTO playlists (name, songs, user_id, last_edited)
      VALUES (?, ?, ?, NOW())
    `;

    db.query(
      insertPlaylistQuery,
      [name, songsJSON, userId],
      (insertErr, result) => {
        if (insertErr) {
          console.error("ERROR: Error creating playlist:", insertErr);
          return res
            .status(500)
            .json({ error: "Database error creating playlist" });
        }

        res.status(201).json({
          message: "Playlist created successfully",
          playlistId: result.insertId,
        });
      }
    );
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
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Playlist deleted successfully
 *       400:
 *         description: Missing playlistId or username
 *       403:
 *         description: Forbidden - You do not own this playlist
 *       404:
 *         description: User or Playlist not found
 *       500:
 *         description: Server error
 */
app.post("/delete-playlist", (req, res) => {
  const { playlistId, username } = req.body;

  if (!playlistId || !username) {
    return res
      .status(400)
      .json({ error: "playlistId and username are required" });
  }

  const findUserQuery = "SELECT user_id FROM users WHERE username = ?";
  db.query(findUserQuery, [username], (err, userResults) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].user_id;

    const selectQuery =
      "SELECT name, user_id FROM playlists WHERE playlist_id = ?";
    db.query(selectQuery, [playlistId], (selectErr, playlistResults) => {
      if (selectErr) {
        console.error("Error fetching playlist:", selectErr);
        return res.status(500).json({ error: "Database error" });
      }

      if (playlistResults.length === 0) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      const playlist = playlistResults[0];
      const playlistName = playlist.name;

      if (playlist.user_id !== userId) {
        return res.status(403).json({
          error:
            "Forbidden: You do not have permission to delete this playlist.",
        });
      }

      const deleteQuery = "DELETE FROM playlists WHERE playlist_id = ?";
      db.query(deleteQuery, [playlistId], (deleteErr, result) => {
        if (deleteErr) {
          console.error("Error deleting playlist:", deleteErr);
          return res.status(500).json({ error: "Database error" });
        }

        res.status(200).json({
          message: "Playlist deleted successfully",
          deletedPlaylistName: playlistName,
        });
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
 *     summary: Add a song to an existing playlist (Requires Ownership)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playlistId:
 *                 type: integer
 *               username:
 *                 type: string
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
 *       400:
 *         description: Invalid input or duplicate song
 *       403:
 *         description: Forbidden - You do not own this playlist
 *       404:
 *         description: User or Playlist not found
 *       500:
 *         description: Server error
 */
app.post("/add-song", (req, res) => {
  const { playlistId, song, username } = req.body;

  if (!playlistId || !song || !song.title || !song.artist || !username) {
    return res.status(400).json({
      error:
        "playlistId, username, and song (with title and artist) are required",
    });
  }

  const findUserQuery = "SELECT user_id FROM users WHERE username = ?";
  db.query(findUserQuery, [username], (err, userResults) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].user_id;

    const selectQuery =
      "SELECT songs, user_id FROM playlists WHERE playlist_id = ?";
    db.query(selectQuery, [playlistId], (selectErr, playlistResults) => {
      if (selectErr) {
        console.error("Error fetching playlist:", selectErr);
        return res.status(500).json({ error: "Database error" });
      }

      if (playlistResults.length === 0) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      const playlist = playlistResults[0];

      if (playlist.user_id !== userId) {
        return res.status(403).json({
          error: "Forbidden: You do not have permission to edit this playlist.",
        });
      }

      let songs = [];
      try {
        songs = JSON.parse(playlist.songs);
      } catch (parseErr) {
        console.error("Error parsing songs JSON:", parseErr);
        return res
          .status(500)
          .json({ error: "Failed to parse playlist songs" });
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
        WHERE playlist_id = ?
      `;

      db.query(
        updateQuery,
        [JSON.stringify(songs), playlistId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating playlist:", updateErr);
            return res.status(500).json({ error: "Database error" });
          }

          res.status(200).json({ message: "Song added successfully", songs });
        }
      );
    });
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *       400:
 *         description: Username and password are required
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    const hash = user.password_hash;

    bcrypt.compare(password, hash, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        return res.status(500).json({ error: "Error during login" });
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      res.status(200).json({
        message: "Login successful",
        user: {
          userId: user.user_id,
          username: user.username,
        },
      });
    });
  });
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       400:
 *         description: Username and password are required
 *       500:
 *         description: Server error or username already taken
 */
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: "Error creating user" });
    }

    const query = `
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
    `;

    db.query(query, [username, hash], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Username already taken." });
        }
        console.error("Error saving user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({
        message: "User created successfully",
        userId: result.insertId,
      });
    });
  });
});

app.listen(port, () => {
  console.log(`The Queue listening on port ${port}`);
});
