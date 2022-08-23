import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context";
import style from "./Header.module.css";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const location = useLocation();

  const getActions = () => {
    if (user) {
      return (
        <>
          {location.pathname !== "/history" && (
            <button
              className={style.action}
              onClick={() => navigate("history")}
            >
              Game History
            </button>
          )}
          <button
            className={style.action}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </>
      );
    } else {
      return location.pathname !== "/login" ? (
        <button className={style.action} onClick={() => navigate("login")}>
          Login
        </button>
      ) : (
        <button className={style.action} onClick={() => navigate("sign-up")}>
          Sign Up
        </button>
      );
    }
  };

  return (
    <header className={style.header}>
      <div className={style.container}>
        <Link to="/">GOMOKU</Link>
        <div className={style.buttons}>{getActions()}</div>
      </div>
    </header>
  );
}
