import GoBoard from "../components/GoBoard";
import style from "./Home.module.css";

export default function Game({ size }: { size: number }) {
  return (
    <>
      <div className={style.containerOuter}>
        <div>
          <GoBoard size={size} />
        </div>
      </div>
    </>
  );
}
