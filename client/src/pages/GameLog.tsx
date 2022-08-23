import { useContext } from "react";
import { UserContext } from "../context";
import { Navigate, useParams, Link } from "react-router-dom";
import style from "./Home.module.css";
import GoGrid from "../components/GoGrid";

export default function GameLog() {
  const { user } = useContext(UserContext);

  const games = JSON.parse(localStorage.getItem("history") ?? "[]");
  const { gameId } = useParams();
  if (!gameId) return null;
  const game = games[parseInt(gameId) - 1];
  if (!game) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className={style.containerOuter}>
      <div style={{ textAlign: "center" }}>
        <b>Winner: {game.winner}</b>
        <br />
        <br />
        <GoGrid board={game.board} shouldShowNumbers={true} />
        <br />
        <br />
        <Link className={style.gameButton} to={"/history"}>
          Back
        </Link>
      </div>
    </div>
  );
}
