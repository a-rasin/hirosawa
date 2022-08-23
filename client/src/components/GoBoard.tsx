import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoGrid from "./GoGrid";
import style from "../pages/Home.module.css";

const GoBoard = ({ size }: { size: number }) => {
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

  useEffect(() => {
    let available = 0;

    for (let i = 0; i < board.length; i++) {
      let x = 1,
        y = 1;
      for (let j = 0; j < board.length; j++) {
        if (board[i][j].stone === 0) {
          available++;
        }

        // Skip first item
        if (j === 0) {
          continue;
        }

        // If previous stone is different to current one reset counter
        if (board[i][j].stone !== board[i][j - 1].stone) {
          x = 1;
        } else {
          x++;
        }

        // If previous stone is different to current one reset counter
        if (board[j][i].stone !== board[j - 1][i].stone) {
          y = 1;
        } else {
          y++;
        }

        if (x === 5 && board[i][j].stone !== 0) {
          setWinner(board[i][j].stone - 1);
          return;
        }

        if (y === 5 && board[j][i].stone !== 0) {
          setWinner(board[j][i].stone - 1);
          return;
        }
      }
    }

    if (available === 0) {
      setWinner(2);
    }
  }, [turn]);

  const handleClick = (i: number, j: number) => {
    if (board[i][j].stone === 0 && winner === -1) {
      board[i][j].stone = turn + 1;
      board[i][j].move = moveNum + 1;
      setTurn((turn + 1) % 2);
      setMoveNum(moveNum + 1);
    }
  };

  const handleReset = () => {
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
  };

  const handleLeave = () => {
    if (winner === -1) {
      navigate("/");
      return;
    }

    // Save game to localStorage
    let history = JSON.parse(localStorage.getItem("history") ?? "[]");
    const curGame = {
      gameId: history.length + 1,
      date: new Date().toLocaleDateString("en-GB"),
      winner: ["White", "Black", "Draw"][winner],
      board,
    };

    history.push(curGame);
    localStorage.setItem("history", JSON.stringify(history));
    navigate("/history");
  };

  return (
    <div className={style.containerOuter}>
      <div style={{ textAlign: "center" }}>
        {winner >= 0 && <b>Winner: {["White", "Black", "Draw"][winner]}</b>}
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
