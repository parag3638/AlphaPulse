"use client"
import React, { createContext, useContext } from "react";

export type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  // Add more fields as needed
};

export const UserContext = createContext<User | null>(null);

export function useUser() {
  return useContext(UserContext);
}

export const UserProvider = UserContext.Provider;
