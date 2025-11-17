import { useEffect, useState } from "react";
import Post from "./Post";

function Home() {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/feed")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Data fetching failed");
        }
        return response.json();
      })
      .then((data) => {
        setFeed(data);
      });
  }, []);
  console.log(feed);
  return (
    <>
      <div>
        <h1>The Queue</h1>
        {feed.map((playlist) => (
          <Post data={playlist} />
        ))}
      </div>
    </>
  );
}

export default Home;
