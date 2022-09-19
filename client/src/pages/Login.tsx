import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../context";
import { useNavigate } from "react-router";
import { Input, Button, Message } from "../components";
import Cookies from 'js-cookie';

import style from "./Login.module.css";

export default function Login() {
  const { login } = useContext(UserContext);
  const usernameInput = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialInvalid, setIsCredentialInvalid] = useState(false);

  const handleLogin = async () => {
    const data = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password})
    });

    if (data.status !== 200) {
      setIsCredentialInvalid(true);
    }

    const json = await data.json();

    if (json.success) {
      login(json.user);
      navigate("/")
    } else {
      setIsCredentialInvalid(true);
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
        handleLogin();
      }}
    >
      {isCredentialInvalid && (
        <Message variant="error" message="Invalid username or password" />
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
      <Button type="submit">Login</Button>
    </form>
  );
}
