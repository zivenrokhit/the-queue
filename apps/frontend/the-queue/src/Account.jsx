import { useState } from "react";
import SignUp from "./signUp";
import SignIn from "./signIn";

export default function Account(props) {
  const [accountView, setAccountView] = useState("");

  if (props.isLoggedIn) {
    return <h1>Account</h1>;
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
