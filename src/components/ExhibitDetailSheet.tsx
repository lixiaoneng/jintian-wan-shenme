"use client";

import { useState } from "react";
import { deleteActivity, type ExhibitEntry } from "@/lib/storage";
import { useAppState } from "@/lib/app-state";
import { guessIcon } from "@/lib/idea-visual";
import { daysAgoLabel } from "@/lib/recommend";

const DEFAULT_REFLECTION = "这件小事真的发生过。";

export function ExhibitDetailSheet({
  entry,
  onClose,
}: {
  entry: ExhibitEntry;
  onClose: () => void;
}) {
  const { bumpRefresh } = useAppState();
  const [busy, setBusy] = useState(false);
  const icon = guessIcon(entry.idea.text);

  async function handleDelete() {
    if (busy) return;
    if (!confirm("要把这件藏品从博物馆里取下吗？取下之后就找不回来啦。")) return;
    setBusy(true);
    try {
      await deleteActivity(entry.activity.id);
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
          className="mx-auto mb-[18px] h-[5px] w-[44px] rounded-full"
          style={{ background: "rgba(58,54,45,.15)" }}
        />

        <div className="flex items-center gap-[12px]">
          <div
            className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[14px] text-[22px]"
            style={{ background: "var(--color-sage-chip)" }}
          >
            {icon}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-[16px] font-bold text-ink">这件藏品</span>
            <span className="text-[12.5px] text-ink-faint">
              {daysAgoLabel(entry.activity.completed_at as string)}入馆
            </span>
          </div>
        </div>

        <div
          className="mt-[16px] rounded-[20px] bg-white p-[18px]"
          style={{ boxShadow: "0 4px 16px rgba(90,84,64,.06)" }}
        >
          <div className="text-[16px] font-bold leading-[1.4] text-ink">
            {entry.activity.action_text}
          </div>
          <div className="mt-[8px] text-[14px] leading-[1.6] text-ink-secondary">
            「{entry.reflectionText ?? DEFAULT_REFLECTION}」
          </div>
          {entry.mood && (
            <div className="mt-[10px]">
              <span
                className="rounded-full px-[10px] py-[4px] text-[12px] font-semibold"
                style={{ background: "var(--color-sage-chip)", color: "var(--color-sage-text)" }}
              >
                {entry.mood}
              </span>
            </div>
          )}
        </div>

        <div className="mt-[22px] flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={busy}
            className="text-[13.5px] font-medium text-ink-faint"
          >
            取下这件藏品
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-full px-[22px] py-[12px] text-[15px] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--color-sage)", boxShadow: "var(--shadow-btn)" }}
          >
            留着它
          </button>
        </div>
      </div>
    </div>
  );
}
