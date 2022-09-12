import { useState, useEffect } from "react";
import { User } from "../types";
import { UserContext } from "../context";

type UserProviderProps = {
  children: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | undefined>(undefined);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(undefined);

  useEffect(() => {
    const getUser = async () => {
      const data = await fetch("/user");

      const json = await data.json();
      if (data.status === 200) {
        login(json);
      }
    }

    getUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
