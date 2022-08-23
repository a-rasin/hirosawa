import { useState, useEffect } from 'react';
import style from "./GoGrid.module.css";
import { Stone } from "../types/Game";

interface GoGridProps {
  board: Stone[][];
  handleClick?: (i: number, j: number) => void;
  shouldShowNumbers: boolean;
}

let interval: NodeJS.Timer;

const getStoneClassName = (stone: Stone, shouldShowNumbers: boolean, counter: number): string => {
  if (shouldShowNumbers) {
    if (counter < stone.move || stone.stone == 0) {
      return "";
    }
  }

  return [style.available, style.white, style.black][stone.stone];
}

const GoGrid = ({ board, handleClick, shouldShowNumbers }: GoGridProps) => {
  const [counter, setCounter] = useState(0);
  const myHandleClick = handleClick ?? (() => null);

  if (shouldShowNumbers && board.length * board.length <= counter) {
    clearInterval(interval);
  }

  useEffect(() => {
    if (!shouldShowNumbers) {
      return;
    }

    interval = setInterval(() => {
      setCounter(pr => pr + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id={style.board}>
      {board.map((a, i) => (
        <div className={style.row}>
          {a.map((b, j: number) => (
            <div
              onClick={() => myHandleClick(i, j)}
              className={style.stone + " " + getStoneClassName(b, shouldShowNumbers, counter)}
            >
              {shouldShowNumbers && b.move > 0 ? b.move : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GoGrid;
