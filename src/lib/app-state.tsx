"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Idea, Note } from "./types";

type Overlay =
  | { type: "none" }
  | { type: "spark" }
  | { type: "ideaDetail"; idea: Idea }
  | { type: "experience"; idea: Idea; actionText: string }
  | { type: "note" }
  | { type: "noteDetail"; note: Note };

type AppStateValue = {
  overlay: Overlay;
  openSpark: () => void;
  openIdeaDetail: (idea: Idea) => void;
  openExperience: (idea: Idea, actionText: string) => void;
  openNoteComposer: () => void;
  openNoteDetail: (note: Note) => void;
  closeOverlay: () => void;
  refreshKey: number;
  bumpRefresh: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>({ type: "none" });
  const [refreshKey, setRefreshKey] = useState(0);

  const openSpark = useCallback(() => setOverlay({ type: "spark" }), []);
  const openIdeaDetail = useCallback(
    (idea: Idea) => setOverlay({ type: "ideaDetail", idea }),
    []
  );
  const openExperience = useCallback(
    (idea: Idea, actionText: string) =>
      setOverlay({ type: "experience", idea, actionText }),
    []
  );
  const openNoteComposer = useCallback(() => setOverlay({ type: "note" }), []);
  const openNoteDetail = useCallback(
    (note: Note) => setOverlay({ type: "noteDetail", note }),
    []
  );
  const closeOverlay = useCallback(() => setOverlay({ type: "none" }), []);
  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const value = useMemo(
    () => ({
      overlay,
      openSpark,
      openIdeaDetail,
      openExperience,
      openNoteComposer,
      openNoteDetail,
      closeOverlay,
      refreshKey,
      bumpRefresh,
    }),
    [
      overlay,
      openSpark,
      openIdeaDetail,
      openExperience,
      openNoteComposer,
      openNoteDetail,
      closeOverlay,
      refreshKey,
      bumpRefresh,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
