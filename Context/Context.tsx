import React from "react";

export interface ISignIn {
  login: string;
  password: string;
}

interface IContextProps {
  signIn: (data: ISignIn, offline?: boolean) => Promise<void> | Promise<string>;
  signOut: () => Promise<void>;
  signUp: (data: any) => Promise<void>;
}

export const AuthContext = React.createContext<IContextProps>(null);