import { useNavigate } from "react-router-dom";
import style from "../pages/Home.module.css";

type GameItemProps = {
  gameId: number;
  winner: string;
  date: string;
};

export default function GameList(props: GameItemProps) {
  const { gameId, winner, date } = props;
  const navigate = useNavigate();

  return (
    <div className={style.gameLog}>
      <div className={style.title}>Game #{gameId}</div>
      <div className={style.title}>Winner: {winner}</div>
      <div className={style.title}>Date: {date}</div>
      <button
        className={style.gameButton}
        onClick={() => navigate(`/game-log/${gameId}`)}
      >
        View Game Log
      </button>
    </div>
  );
}
