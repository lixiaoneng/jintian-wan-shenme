"use client";

import { AppStateProvider, useAppState } from "@/lib/app-state";
import { BottomNav } from "@/components/BottomNav";
import { Fab } from "@/components/Fab";
import { SparkSheet } from "@/components/SparkSheet";
import { IdeaDetailSheet } from "@/components/IdeaDetailSheet";
import { ExperienceOverlay } from "@/components/ExperienceOverlay";
import { NoteComposer } from "@/components/NoteComposer";
import { NoteDetailSheet } from "@/components/NoteDetailSheet";

function Shell({ children }: { children: React.ReactNode }) {
  const { overlay, closeOverlay } = useAppState();

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-page">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Fab />
      <BottomNav />

      {overlay.type === "spark" && <SparkSheet onClose={closeOverlay} />}
      {overlay.type === "ideaDetail" && (
        <IdeaDetailSheet idea={overlay.idea} onClose={closeOverlay} />
      )}
      {overlay.type === "experience" && (
        <ExperienceOverlay
          idea={overlay.idea}
          actionText={overlay.actionText}
          onClose={closeOverlay}
        />
      )}
      {overlay.type === "note" && <NoteComposer onClose={closeOverlay} />}
      {overlay.type === "noteDetail" && (
        <NoteDetailSheet note={overlay.note} onClose={closeOverlay} />
      )}
    </div>
  );
}

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <Shell>{children}</Shell>
    </AppStateProvider>
  );
}
