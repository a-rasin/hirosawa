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

    fetch("/api/games")
      .then(data => data.json())
      .then(data => console.log(data))
  }, []);

  const handleStart = async () => {
    if (boardSize) {
      const data = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({size: boardSize})
      });

      if (data.status !== 200) {
        return;
      }

      const json = await data.json();

      navigate("/game/" + json.data._id);
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
