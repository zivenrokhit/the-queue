import { useState } from "react";

export default function EditPlaylist({
  playlist,
  user,
  onBack,
  onUpdatePlaylist,
}) {
  const [playlistName, setPlaylistName] = useState(playlist?.name || "");
  const [songQuery, setSongQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [songsList, setSongsList] = useState(playlist?.songs || []);

  function SearchSongs(value) {
    if (value !== "") {
      fetch("http://localhost:8080/search-songs?query=" + value)
        .then((response) => {
          if (!response.ok) throw new Error("Data fetching failed");
          return response.json();
        })
        .then((data) => setSearchResults(data))
        .catch((err) => console.error("Search failed:", err));
    } else {
      setSearchResults([]);
    }
  }

  function addSong(song) {
    setSongsList((prev) => [...prev, song]);
  }

  const removeSong = (index) => {
    setSongsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const submitEdit = async () => {
    if (!user) {
      alert("Please log in to edit the playlist");
      return;
    }

    if (playlistName === "" || songsList.length === 0) {
      alert("Please enter a playlist name and have at least one song");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/edit-songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: playlist.playlist_id,
          name: playlistName,
          songs: songsList,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Playlist updated successfully!");
        if (onUpdatePlaylist) {
          onUpdatePlaylist({
            ...playlist,
            name: playlistName,
            songs: songsList,
          });
        }
      } else {
        alert(`Error updating playlist: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Edit failed", err);
      alert("Edit failed: " + err.message);
    }
  };

  return (
    <div id="edit-playlist">
      <h2>Editing Playlist: {playlist.name}</h2>

      <div id="create-playlist">
        <label>Enter playlist Name:</label>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />

        <div id="search-songs">
          <label>Enter The Name of the song you wish to add:</label>
          <input
            type="text"
            placeholder="Search..."
            value={songQuery}
            onChange={(e) => {
              setSongQuery(e.target.value);
              SearchSongs(e.target.value);
            }}
          />
          <div className="dropdown">
            {searchResults.map((result, idx) => (
              <p key={idx} onMouseDown={() => addSong(result)}>
                {result.title} | {result.artist}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div id="song-list">
        <h3>Songs in Playlist:</h3>
        {songsList.map((song, idx) => (
          <div
            key={idx}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>
              {song.title} | {song.artist}
            </span>
            <button onClick={() => removeSong(idx)}>x</button>
          </div>
        ))}
      </div>

      <button onClick={submitEdit}>Submit Edit</button>
      <button onClick={onBack}>Back</button>
    </div>
  );
}
