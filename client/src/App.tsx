import { useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Header, UserProvider } from "./components";
import { Home, Login, SignUp, Game, GameLog, History } from "./pages";

function App() {
  const [boardSize, setBoardSize] = useState(0);
  return (
    <>
      <UserProvider>
        <Header />
        <main className="main">
          <Routes>
            <Route
              path="/"
              element={
                <Home boardSize={boardSize} setBoardSize={setBoardSize} />
              }
            />
            <Route path="game-log/:gameId" element={<GameLog />} />
            <Route path="login" element={<Login />} />
            <Route path="signUp" element={<SignUp />} />
            <Route path="history" element={<History />} />
            <Route path="game" element={<Game size={boardSize} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </UserProvider>
    </>
  );
}

export default App;
