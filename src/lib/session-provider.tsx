"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ensureSeeded, LOCAL_USER_ID } from "./storage";

type SessionState = {
  userId: string | null;
  ready: boolean;
};

const SessionContext = createContext<SessionState>({
  userId: null,
  ready: false,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 首次打开且本地为空时写入 demo 数据，然后标记就绪。
    ensureSeeded();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  return (
    <SessionContext.Provider
      value={{ userId: ready ? LOCAL_USER_ID : null, ready }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
