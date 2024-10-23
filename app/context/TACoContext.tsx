import { createContext, useCallback, useEffect, useState } from "react";
import { env } from "@/env.mjs";
import { domains, initialize } from "@nucypher/taco";

const ritualId = Number(env.NEXT_PUBLIC_TACO_RITUAL_ID) ?? 0;
const domain = env.NEXT_PUBLIC_TACO_DOMAIN ?? domains.TESTNET;

export const TACoContext = createContext({isInitialized: false, ritualId, domain});

export function TACoContextProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeTACo = useCallback(() => {
    initialize().then(() => setIsInitialized(true));
  }, [setIsInitialized]);

  useEffect(() => {
    if (!isInitialized) {
      initializeTACo();
    }
  },[initializeTACo, isInitialized]);

  const tacoContext = {
    isInitialized,
    ritualId,
    domain,
  };

  return (
    <TACoContext.Provider value={tacoContext}>
      {children}
    </TACoContext.Provider>
  )
}
