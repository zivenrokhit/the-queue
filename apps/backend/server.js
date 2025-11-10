const express = require("express");
const mysql = require("mysql");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/feed", (req, res) => {
  res.send("Hello World!");
});

app.post("/like", (req, res) => {
  res.send("Hello World!");
});

app.post("/dislike", (req, res) => {
  res.send("Hello World!");
});

app.post("/create-playlist", (req, res) => {
  res.send("Hello World!");
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
