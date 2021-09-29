import React, { createContext, useContext, useReducer } from "react";
import Reducer from "./reducer";
import useLocalStorage from "../hooks/localStorage";

const AppContext = createContext([[],() => {}]);

export function AppContextProvider({ children }) {
  const [ lang ] = useLocalStorage("lang", "es");
  const [ theme ] = useLocalStorage("theme", "clasic");
  const initialState = {
    theme,
    lang,
    isLoading: false
  };

  return (
    <AppContext.Provider value={useReducer(Reducer, initialState)}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
