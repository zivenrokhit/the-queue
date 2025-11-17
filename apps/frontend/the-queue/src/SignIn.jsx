import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export default function SignIn({ onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>Sign In</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#FF751F",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
          onClick={handleSubmit}
        >
          Sign In
        </button>
      </form>

      <button
        onClick={onBack}
        style={{
          marginTop: "20px",
          background: "none",
          border: "none",
          color: "#FF751F",
          textDecoration: "underline",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Back
      </button>
    </div>
  );
}
