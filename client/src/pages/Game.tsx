import GoBoard from "../components/GoBoard";
import style from "./Home.module.css";
import { useParams } from "react-router-dom";

export default function Game({ size }: { size: number }) {
  const { gameId = '' } = useParams();
  return (
    <>
      <div className={style.containerOuter}>
        <div>
          <GoBoard gameId={gameId} size={size} />
        </div>
      </div>
    </>
  );
}
