import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context";
import { useNavigate } from "react-router";
import { GameItem } from "../components";
import style from "../pages/Home.module.css";

export default function History() {
  const [games, setGames] = useState([]);

  const getGames = async () => {
    const data = await fetch('/games');
    setGames((await data.json())?.data);
  };

  useEffect(() => {
    getGames();
  }, []);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) navigate("/home");

  return (
    <>
      <div className={style.containerOuter}>
        <div>
          {games.map(
            ({
              _id: id,
              date,
              winner,
            }: {
              _id: number;
              date: string;
              winner: number;
            }) => (
              <GameItem
                key={id}
                gameId={id}
                date={date}
                winner={['None', 'White', 'Black', 'Draw'][winner]}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}
