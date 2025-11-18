import { useState, useEffect } from "react";
import SignUp from "./signUp";
import SignIn from "./signIn";
import { useAuth } from "./AuthContext";
import Post from "./Post";

export default function Account(props) {
  const [accountView, setAccountView] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!user || !user.userId) {
      console.log("User not ready yet:", user);
      return;
    }

    console.log("Fetching playlists for user:", user.userId);

    fetch(`http://localhost:8080/get-my-playlists?userId=${user.userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched playlists:", data);
        setPlaylists(data);
      })
      .catch((err) => console.error("Error fetching playlists:", err));
  }, [user]);

  if (isLoggedIn) {
    return (
      <>
        <h1>Account</h1>
        <div
          style={{
            backgroundColor: "#FAC3A4",
            padding: "10px",
            borderRadius: "20px",
            marginTop: "20px",
            textAlign: "center",
            WebkitTextFillColor: "black",
          }}
        >
          <h2>Welcome {user ? user.username : "User"}!</h2>
          <h3>Here are your playlists:</h3>
          {playlists.map((playlist) => (
            <Post key={playlist.playlist_id} data={playlist} />
          ))}

          <div style={{ marginTop: "20px", color: "gray" }}>
            <p>No playlists created yet.</p>
          </div>
        </div>
      </>
    );
  }

  if (accountView === "signup") {
    return (
      <>
        <h1>Account</h1>
        <SignUp onBack={() => setAccountView("")} />
      </>
    );
  }

  if (accountView === "signin") {
    return (
      <>
        <h1>Account</h1>
        <SignIn onBack={() => setAccountView("")} />
      </>
    );
  }

  return (
    <>
      <h1>Account</h1>

      <div>
        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderTopLeftRadius: "50px",
            borderBottomRightRadius: "50px",
            borderTopRightRadius: "50px",
            borderBottomLeftRadius: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h2>Already Have an account?</h2>
          <h2
            style={{
              textDecoration: "underline",
              color: "#FF751F",
              cursor: "pointer",
            }}
            onClick={() => setAccountView("signin")}
          >
            Sign in
          </h2>
        </div>

        <div>
          <h1> </h1>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderTopLeftRadius: "50px",
            borderBottomRightRadius: "50px",
            borderTopRightRadius: "50px",
            borderBottomLeftRadius: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h2>New here?</h2>
          <h2
            style={{
              textDecoration: "underline",
              color: "#FF751F",
              cursor: "pointer",
            }}
            onClick={() => setAccountView("signup")}
          >
            Create an account
          </h2>
        </div>
      </div>
    </>
  );
}
