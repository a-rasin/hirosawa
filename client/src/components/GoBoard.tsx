import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoGrid from "./GoGrid";
import style from "../pages/Home.module.css";

const GoBoard = ({ size, gameId }: { size: number, gameId: string }) => {
  // create board with each stone as an object. 'stone' = id of the stone and 'move' = the order of the move
  const [board, setBoard] = useState([[{ stone: 0, move: 0 }]]);
  const [turn, setTurn] = useState(1);
  const [moveNum, setMoveNum] = useState(0);
  const [winner, setWinner] = useState(-1);
  const navigate = useNavigate();

  // Populate board with initial data
  useEffect(() => {
    handleReset();
  }, []);

  const handleClick = async (i: number, j: number) => {
    if (board[i][j].stone === 0 && winner === -1) {
      board[i][j].stone = turn + 1;
      board[i][j].move = moveNum + 1;
      setTurn((turn + 1) % 2);
      setMoveNum(moveNum + 1);

      const data = await fetch('/api/game', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: gameId,
          move: {
            x: i,
            y: j,
            stone: turn + 1
          }
        })
      });

      const json = await data.json();

      if (json.isGameFinished) {
        setWinner(json.winner)
      }
    }
  };

  const handleReset = async () => {
    if (winner !== -1) {
      return;
    }

    let temp = new Array(size).fill([]);
    const emptyStone = { stone: 0, move: 0 };

    temp = temp.map(() =>
      new Array(size).fill(0).map(() => Object.assign({}, emptyStone))
    );

    setBoard(temp);

    setTurn(1);
    setMoveNum(0);

    await fetch('/api/game', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        game: gameId,
        move: {
          reset: true
        }
      })
    });
  };

  const handleLeave = async () => {
    if (winner === -1) {
      // Delete game
      await fetch('/api/game/' + gameId, {
        method: 'DELETE'
      });

      navigate("/");
      return;
    }

    navigate("/history");
  };

  return (
    <div className={style.containerOuter}>
      <div style={{ textAlign: "center" }}>
        {winner !== -1 && <b>Winner: {winner}</b>}
        {winner === -1 && <b>Current Player: {["White", "Black"][turn]}</b>}
        <br />
        <br />
        <GoGrid
          board={board}
          handleClick={handleClick}
          shouldShowNumbers={false}
        />
        <br />
        <br />
        <button className={style.gameButton} onClick={handleReset}>
          Restart
        </button>
        <button className={style.gameButton} onClick={handleLeave}>
          Leave
        </button>
      </div>
    </div>
  );
};

export default GoBoard;
