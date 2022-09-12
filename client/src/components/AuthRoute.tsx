import { useContext, ReactNode } from "react";
import { Navigate } from "react-router";
import { UserContext } from "../context";

const AuthRoute = ({children}: {children: ReactNode}) => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      {children}
    </>
  )
}

export default AuthRoute
