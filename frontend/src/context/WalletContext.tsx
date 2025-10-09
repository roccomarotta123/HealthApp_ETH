import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface WalletContextType {
  account: string | null;
  setAccount: (account: string | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  // Recupera l'account da localStorage all'avvio
  const [account, setAccountState] = useState<string | null>(() => {
    return localStorage.getItem("account") || null;
  });

  // Aggiorna sia lo stato che localStorage
  const setAccount = (acc: string | null) => {
    setAccountState(acc);
    if (acc) {
      localStorage.setItem("account", acc);
    } else {
      localStorage.removeItem("account");
    }
  };

  return (
    <WalletContext.Provider value={{ account, setAccount }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet deve essere usato all'interno di WalletProvider");
  }
  return context;
};
