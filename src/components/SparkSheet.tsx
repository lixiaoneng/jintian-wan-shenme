"use client";

import { useState } from "react";
import { useSession } from "@/lib/session-provider";
import { createIdea } from "@/lib/storage";
import { IDEA_TAGS, type IdeaTag } from "@/lib/types";
import { useAppState } from "@/lib/app-state";

export function SparkSheet({ onClose }: { onClose: () => void }) {
  const { userId } = useSession();
  const { bumpRefresh } = useAppState();
  const [text, setText] = useState("");
  const [tag, setTag] = useState<IdeaTag | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [seedFalling, setSeedFalling] = useState(false);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || !userId || submitting) return;
    setSubmitting(true);
    setSeedFalling(true);
    try {
      await createIdea(userId, trimmed, tag);
      bumpRefresh();
      setTimeout(() => {
        onClose();
      }, 650);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
      setSeedFalling(false);
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
          className="mx-auto mb-[22px] h-[5px] w-[44px] rounded-full"
          style={{ background: "rgba(58,54,45,.15)" }}
        />
        <div className="text-[22px] font-bold text-ink">冒出什么念头了？</div>
        <div className="mt-[6px] text-[14px] text-ink-secondary">
          先接住它，之后再说～
        </div>

        <div
          className="relative mt-[20px] min-h-[96px] rounded-[20px] bg-white p-[18px]"
          style={{
            border: "1.5px solid #d9e0cb",
            boxShadow: "0 4px 16px rgba(90,84,64,.06)",
          }}
        >
          {seedFalling && (
            <span
              className="animate-seed-fall pointer-events-none absolute right-[22px] top-[8px] h-[9px] w-[9px]"
              style={{
                background: "#c9a86a",
                borderRadius: "50% 50% 50% 0",
              }}
            />
          )}
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="比如：想学做手冲咖啡"
            rows={3}
            className="w-full resize-none bg-transparent text-[18px] leading-[1.5] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>

        <div className="mt-[16px] flex flex-wrap gap-[9px]">
          {IDEA_TAGS.map((t) => {
            const active = tag === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTag(active ? null : t.value)}
                className="rounded-full px-[15px] py-[8px] text-[13px] font-semibold"
                style={
                  active
                    ? { background: "var(--color-sage-chip)", color: "var(--color-sage-text)" }
                    : { background: "var(--color-cream-chip)", color: "rgba(58,54,45,.55)" }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-[22px] flex items-center gap-[12px]">
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="h-[56px] flex-1 rounded-full text-[17px] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--color-sage)", boxShadow: "var(--shadow-btn)" }}
          >
            先记下 · 种一颗
          </button>
          <button
            aria-label="语音记录（暂不支持）"
            className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white text-[22px]"
            style={{ border: "1.5px solid #d9e0cb", color: "var(--color-sage-text)" }}
          >
            🎙
          </button>
        </div>
        <div className="mt-[14px] text-center text-[13.5px] font-medium text-ink-faint">
          不用分类也没关系，之后想起来再补
        </div>
      </div>
    </div>
  );
}
