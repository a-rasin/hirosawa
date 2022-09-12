import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../context";
import { useNavigate } from "react-router";
import { Input, Button, Message } from "../components";

import style from "./Login.module.css";

export default function SignUp() {
  const { login } = useContext(UserContext);
  const usernameInput = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialInvalid, setIsCredentialInvalid] = useState(false);

  const handleSignUp = async () => {
    const data = await fetch('/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password})
    });

    switch (data.status) {
      case 200:
        const json = await data.json();
        login(json.user);
        navigate("/")
      break;
      case 500:
        setIsCredentialInvalid(true);
      break;
    }
  };

  useEffect(() => {
    if (usernameInput.current) {
      usernameInput.current.focus();
    }
  }, []);

  return (
    <form
      className={style.container}
      onSubmit={(e) => {
        e.preventDefault();
        handleSignUp();
      }}
    >
      {isCredentialInvalid && (
        <Message variant="error" message="Username already taken" />
      )}
      <Input
        ref={usernameInput}
        name="username"
        placeholder="Username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setIsCredentialInvalid(false);
        }}
      />
      <Input
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setIsCredentialInvalid(false);
        }}
      />
      <Button type="submit">Sign Up</Button>
    </form>
  );
}

