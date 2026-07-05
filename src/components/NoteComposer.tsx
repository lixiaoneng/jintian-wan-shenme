"use client";

import { useState } from "react";
import { createNote } from "@/lib/storage";
import { useAppState } from "@/lib/app-state";

// 极简随手记：想到什么写什么，不问任何问题、不分类。
export function NoteComposer({ onClose }: { onClose: () => void }) {
  const { bumpRefresh } = useAppState();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await createNote(trimmed);
      bumpRefresh();
      onClose();
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

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
          className="mx-auto mb-[20px] h-[5px] w-[44px] rounded-full"
          style={{ background: "rgba(58,54,45,.15)" }}
        />
        <div className="text-[22px] font-bold text-ink">记一下</div>
        <div className="mt-[6px] text-[14px] text-ink-secondary">
          想到什么写什么，一句话也行～
        </div>

        <div
          className="mt-[18px] rounded-[20px] bg-white p-[18px]"
          style={{
            border: "1.5px solid #d9e0cb",
            boxShadow: "0 4px 16px rgba(90,84,64,.06)",
          }}
        >
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="今天脑子里冒出了什么…"
            rows={3}
            className="w-full resize-none bg-transparent text-[17px] leading-[1.5] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!text.trim() || busy}
          className="mt-[20px] h-[56px] w-full rounded-full text-[17px] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--color-sage)", boxShadow: "var(--shadow-btn)" }}
        >
          记下来
        </button>
      </div>
    </div>
  );
}
