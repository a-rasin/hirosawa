import { User } from "./../types/User";
import { createContext } from "react";

type UserContextType = {
  user?: User;
  login: (user: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({} as UserContextType);
export default UserContext;
