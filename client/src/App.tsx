import { useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Header, UserProvider, AuthRoute } from "./components";
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
            <Route path="game-log/:gameId" element={<AuthRoute><GameLog /></AuthRoute>} />
            <Route path="login" element={<Login />} />
            <Route path="signUp" element={<SignUp />} />
            <Route path="history" element={<AuthRoute><History /></AuthRoute>} />
            <Route path="game/:gameId" element={<AuthRoute><Game size={boardSize} /></AuthRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </UserProvider>
    </>
  );
}

export default App;
