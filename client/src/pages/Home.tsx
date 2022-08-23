import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import boards from "../data/boards.json";
import style from "./Home.module.css";

export default function Home({
  boardSize,
  setBoardSize,
}: {
  boardSize: number;
  setBoardSize: React.Dispatch<React.SetStateAction<number>>;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    setBoardSize(boards[0].size);

    fetch("http://localhost:5000")
      .then(data => data.json())
      .then(data => console.log(data))
  }, []);

  const handleStart = () => {
    if (boardSize) {
      navigate("/game");
    } else {
      alert("Set Board Size");
    }
  };

  return (
    <div className={style.containerOuter}>
      <div>
        <select
          className={style.dropdown}
          onChange={(e) => setBoardSize(parseInt(e.target.value))}
        >
          <option>- Select Board Size -</option>
          {boards.map(({ id, size }) => (
            <option key={id} value={size}>
              {size} x {size}
            </option>
          ))}
        </select>
        <br />
        <br />
        <button
          className={style.gameButton + " " + style.buttonCentre}
          onClick={() => handleStart()}
        >
          Start
        </button>
      </div>
    </div>
  );
}
