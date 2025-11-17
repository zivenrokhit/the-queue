import React, { useState } from "react";

export default function SignUp({ onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    createAccount();
  };

  const createAccount = async () => {
    fetch("http://localhost:8080/signup", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Sign up failed");
          });
        }
        return response;
      })
      .then((response) => {
        console.log("Sign up successful!");
        onBack();
      })
      .catch((error) => {
        console.error("sign up failed", error.message);
        alert(error.message);
      });
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
      <h2>Sign Up</h2>

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
          placeholder="Create Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
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
        >
          Create Account
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
