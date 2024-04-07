import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
type UserType = {
  id: string;
  email: string;
  name: string;
} | null;

type UserContextType = {
  user: UserType;
  setUser: (user: UserType) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {
    throw new Error('setUser function must be overridden');
  },
});

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<UserType>(null);
  
    useEffect(() => {
      // Load the user data from localStorage when initializing the state
      const savedUser: string | null = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser) as UserType);
      }
    }, []);
  
    useEffect(() => {
      // Save the user data to localStorage whenever it changes
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }, [user]);
  
    return (
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    );
  };

export const useUser = () => useContext(UserContext);