"use client";

import { useEffect, useState } from "react";
import { deleteNote, getIdea, updateNote } from "@/lib/storage";
import { useAppState } from "@/lib/app-state";
import type { Note } from "@/lib/types";

export function NoteDetailSheet({ note, onClose }: { note: Note; onClose: () => void }) {
  const { bumpRefresh } = useAppState();
  const [text, setText] = useState(note.text);
  const [linkedIdeaText, setLinkedIdeaText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!note.idea_id) return;
    getIdea(note.idea_id)
      .then((idea) => setLinkedIdeaText(idea?.text ?? null))
      .catch(console.error);
  }, [note.idea_id]);

  const trimmed = text.trim();
  const dirty = trimmed !== note.text;

  async function handleSaveOrClose() {
    if (busy) return;
    if (!dirty || trimmed.length === 0) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      await updateNote(note.id, trimmed);
      bumpRefresh();
      onClose();
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    if (!confirm("要删掉这条随手记吗？删了就找不回来啦。")) return;
    setBusy(true);
    try {
      await deleteNote(note.id);
      bumpRefresh();
      onClose();
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  const dateLabel = formatDate(note.created_at);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in"
        style={{ background: "rgba(40,36,28,.42)" }}
      />
      <div
        className="animate-sheet-up relative rounded-t-[34px] px-[26px] pt-[18px] pb-[30px]"
        style={{ background: "var(--color-card)", boxShadow: "var(--shadow-sheet)" }}
      >
        <div
          className="mx-auto mb-[18px] h-[5px] w-[44px] rounded-full"
          style={{ background: "rgba(58,54,45,.15)" }}
        />

        <div
          className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {dateLabel}
        </div>

        <div
          className="mt-[10px] rounded-[20px] bg-white p-[18px]"
          style={{
            border: "1.5px solid #d9e0cb",
            boxShadow: "0 4px 16px rgba(90,84,64,.06)",
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full resize-none bg-transparent text-[16px] leading-[1.6] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>

        {linkedIdeaText && (
          <div
            className="mt-[14px] inline-flex items-center gap-[6px] rounded-full px-[12px] py-[6px] text-[13px]"
            style={{ background: "var(--color-sage-chip)", color: "var(--color-sage-text)" }}
          >
            🌱 来自：{linkedIdeaText}
          </div>
        )}

        <div className="mt-[22px] flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={busy}
            className="text-[13.5px] font-medium text-ink-faint"
          >
            删掉这条
          </button>
          <button
            onClick={handleSaveOrClose}
            disabled={busy || trimmed.length === 0}
            className="rounded-full px-[22px] py-[12px] text-[15px] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--color-sage)", boxShadow: "var(--shadow-btn)" }}
          >
            {dirty ? "存一下" : "好了"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
