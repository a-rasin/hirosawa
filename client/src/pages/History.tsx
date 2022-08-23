import { useContext } from "react";
import { UserContext } from "../context";
import { useNavigate } from "react-router";

import { GameItem } from "../components";
import style from "../pages/Home.module.css";

export default function History() {
  const games = JSON.parse(localStorage.getItem("history") ?? "[]");

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) navigate("/home");

  return (
    <>
      <div className={style.containerOuter}>
        <div>
          {games.map(
            ({
              gameId,
              date,
              winner,
            }: {
              gameId: number;
              date: string;
              winner: string;
            }) => (
              <GameItem
                key={gameId}
                gameId={gameId}
                date={date}
                winner={winner}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}
