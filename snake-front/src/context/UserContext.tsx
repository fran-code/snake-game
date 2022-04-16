import React, { createContext, useContext, useState } from 'react';
import { IDataUser } from '../utils/interfaces'


type Props = {
  children: React.ReactNode;
};

export interface IUserDataContext {
  dataUser?: IDataUser;
  setDataUser: (user: IDataUser) => void;
}

const defaultValueContext = {
  dataUser: undefined,
  setDataUser: () => {}
}

export const UserDataContext = createContext<IUserDataContext>(defaultValueContext);
UserDataContext.displayName = 'UserDataContext'

export const DataUserProvider = ({ children }: Props) => {
  const [dataUser, setDataUser] = useState<IDataUser | undefined>(undefined);

  return <UserDataContext.Provider value={{ dataUser, setDataUser }}>{children}</UserDataContext.Provider>
}

export const useUserContext = () => {
  const context = useContext(UserDataContext)

  if (context === undefined) {
    throw new Error(`useUserContext must be used within a DataUserProvider`)
  }
  return context
}