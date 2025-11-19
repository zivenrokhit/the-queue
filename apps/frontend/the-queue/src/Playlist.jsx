import { useEffect, useState } from "react";

export default function Playlist(props) {
  const [playlistName, setPlaylistName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [songsList, setSongslist] = useState([]);

  function SearchSongs(value) {
    if (value != "") {
      fetch("http://localhost:8080/search-songs?query=" + value)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Data fetching failed");
          }
          return response.json();
        })
        .then((data) => {
          setSearchResults(data);
        });
    }
  }
  function addSong(song) {
    setSongslist((prev) => [...songsList, song]);
    console.log(song);
  }

  function submitPlaylist() {
    //submit playlist to backend
    if (playlistName === "" || songsList.length === 0) {
      alert("Please enter a playlist name and add at least one song");
      return;
    }
    if (!props.user) {
      alert("Please log in to create a playlist");
      return;
    }
    const playlistData = {
      name: playlistName,
      username: props.user.username,
      songs: songsList,
    };
    fetch("http://localhost:8080/create-playlist", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playlistData),
    }).then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text || "Playlist creation failed");
        });
      }
      return response;
    });
  }

  return (
    <>
      <div id="create-playlist">
        <label>Enter playlist Name:</label>
        <input type="text" onChange={(e) => setPlaylistName(e.target.value)} />
        <div id="search-songs">
          <label>Enter The Name of the song you wish to add: </label>
          <input
            type="text"
            placeholder="Search.."
            onChange={(e) => SearchSongs(e.target.value)}
          />

          <div className="dropdown">
            {searchResults.map((result, idx) => (
              <p key={idx} onMouseDown={() => addSong(result)}>
                {" "}
                {/* This needs to be onMouseDown otherwise the dropdown menu hides before a click is registered */}
                {result.title} | {result.artist}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div id="song-list">
        <h3>Songs in Playlist:</h3>
          {songsList.map((song, idx) => (
            <p key={idx}>
              {song.title} | {song.artist}
            </p>
          ))}
      </div>
      <button onClick={submitPlaylist}>submit playlist: {playlistName}</button>
    </>
  );
}
