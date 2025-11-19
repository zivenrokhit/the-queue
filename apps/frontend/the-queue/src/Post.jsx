import { useState } from "react";
import thumbsUpIcon from "./assets/thumbsUp.svg";
import linkIcon from "./assets/Link.svg";

export default function Post({ data }) {
  const [clickedLike, setClickedLike] = useState(false);
  const [likeCount, setLikeCount] = useState(data.likes);

  const playlist = data;
  const songs = playlist.songs;
  const noOfSongs = songs.length;

  const height = noOfSongs > 10 ? 400 : noOfSongs * 40;

  const handleLike = async () => {
    if (clickedLike) return; // prevent double click

    setClickedLike(true);
    setLikeCount((prev) => prev + 1);

    try {
      await fetch("http://localhost:8080/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId: playlist.playlist_id }),
      });
    } catch (error) {
      console.error("Like failed", error);
    }
  };

  return (
    <div id="post">
      <h1>{playlist.username}</h1>
      <h2>{playlist.name}</h2>
      <h3>No of songs: {noOfSongs}</h3>

      <div id="songs-box" style={{ height }}>
        {songs.map((song) => (
          <div key={song.title}>
            <h4>
              {song.title} | {song.artist} |
            </h4>
            <a href={song.link}>
              <img
                src={linkIcon}
                alt="song link icon"
                width="20px"
                height="20px"
              />
            </a>
          </div>
        ))}
      </div>

      <div id="bottom-bar">
        <div
          id="like-button"
          onClick={!clickedLike ? handleLike : undefined}
          style={{
            cursor: clickedLike ? "default" : "pointer",
            opacity: clickedLike ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <p>{likeCount}</p>

          {clickedLike ? (
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 16V8C26 6.4087 25.3679 4.88258 24.2426 3.75736C23.1174 2.63214 21.5913 2 20 2L12 20V42H34.56C35.5247 42.0109 36.4608 41.6728 37.1958 41.048C37.9309 40.4232 38.4154 39.5538 38.56 38.6L41.32 20.6C41.407 20.0267 41.3683 19.4414 41.2067 18.8845C41.045 18.3276 40.7642 17.8126 40.3837 17.375C40.0032 16.9375 39.5322 16.5879 39.0031 16.3504C38.4741 16.113 37.8998 15.9934 37.32 16H26ZM12 42H6C4.93913 42 3.92172 41.5786 3.17157 40.8284C2.42143 40.0783 2 39.0609 2 38V24C2 22.9391 2.42143 21.9217 3.17157 21.1716C3.92172 20.4214 4.93913 20 6 20H12"
                fill="#FF0000"
              />
              <path
                d="M12 20L20 2C21.5913 2 23.1174 2.63214 24.2426 3.75736C25.3679 4.88258 26 6.4087 26 8V16H37.32C37.8998 15.9934 38.4741 16.113 39.0031 16.3504C39.5322 16.5879 40.0032 16.9375 40.3837 17.375C40.7642 17.8126 41.045 18.3276 41.2067 18.8845C41.3683 19.4414 41.407 20.0267 41.32 20.6L38.56 38.6C38.4154 39.5538 37.9309 40.4232 37.1958 41.048C36.4608 41.6728 35.5247 42.0109 34.56 42H12M12 20V42M12 20H6C4.93913 20 3.92172 20.4214 3.17157 21.1716C2.42143 21.9217 2 22.9391 2 24V38C2 39.0609 2.42143 40.0783 3.17157 40.8284C3.92172 41.5786 4.93913 42 6 42H12"
                stroke="#1E1E1E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <img src={thumbsUpIcon} alt="Thumbs Up Icon" />
          )}
        </div>
      </div>
    </div>
  );
}
