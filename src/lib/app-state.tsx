"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Idea } from "./types";

type Overlay =
  | { type: "none" }
  | { type: "spark" }
  | { type: "experience"; idea: Idea; actionText: string };

type AppStateValue = {
  overlay: Overlay;
  openSpark: () => void;
  openExperience: (idea: Idea, actionText: string) => void;
  closeOverlay: () => void;
  refreshKey: number;
  bumpRefresh: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>({ type: "none" });
  const [refreshKey, setRefreshKey] = useState(0);

  const openSpark = useCallback(() => setOverlay({ type: "spark" }), []);
  const openExperience = useCallback(
    (idea: Idea, actionText: string) =>
      setOverlay({ type: "experience", idea, actionText }),
    []
  );
  const closeOverlay = useCallback(() => setOverlay({ type: "none" }), []);
  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const value = useMemo(
    () => ({ overlay, openSpark, openExperience, closeOverlay, refreshKey, bumpRefresh }),
    [overlay, openSpark, openExperience, closeOverlay, refreshKey, bumpRefresh]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
