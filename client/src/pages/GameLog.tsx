import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Stone } from "../types/Game";
import style from "./Home.module.css";
import GoGrid from "../components/GoGrid";

interface Game {
  winner: number;
  board: Stone[][];
}

interface Move {
  stone: number;
  x: number;
  y: number;
}

export default function GameLog() {
  const [game, setGame] = useState<Game | null>(null);
  const { gameId } = useParams();
  const navigate = useNavigate();

  const getGame = async () => {
    const data = await fetch('/api/game/' + gameId);
    const json = await data.json();

    if (!json) {
      navigate('/history');
      return;
    }

    let board = new Array(json.data.size).fill([]);

    board = board.map(() => new Array(json.data.size).fill(0).map(() => 0));

    json.data.moves.forEach((a: Move, i: number) => {
      board[a.x][a.y] = {
        stone: a.stone,
        move: i + 1
      };
    });

    setGame({ ...json.data, board });
  };

  useEffect(() => {
    getGame();
  }, []);

  if (!gameId) return null;
  if (!game) return null;

  return (
    <div className={style.containerOuter}>
      <div style={{ textAlign: "center" }}>
        <b>Winner: {['None', 'White', 'Black', 'Draw'][game.winner]}</b>
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
