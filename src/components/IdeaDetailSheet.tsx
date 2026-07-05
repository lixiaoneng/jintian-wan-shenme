"use client";

import { useState } from "react";
import { deleteIdea, updateIdea } from "@/lib/storage";
import { generateAction } from "@/lib/recommend";
import { ideaVisual } from "@/lib/idea-visual";
import { IDEA_TAGS, type Idea, type IdeaTag } from "@/lib/types";
import { useAppState } from "@/lib/app-state";

export function IdeaDetailSheet({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  const { openExperience, bumpRefresh } = useAppState();
  const [text, setText] = useState(idea.text);
  const [tag, setTag] = useState<IdeaTag | null>(idea.tag);
  const [busy, setBusy] = useState(false);

  const trimmed = text.trim();
  const dirty = trimmed !== idea.text || tag !== idea.tag;
  const canSave = trimmed.length > 0 && dirty;
  const v = ideaVisual(trimmed || idea.text);

  async function persistIfNeeded(): Promise<Idea> {
    if (canSave) {
      const updated = await updateIdea(idea.id, { text: trimmed, tag });
      bumpRefresh();
      return updated;
    }
    return idea;
  }

  async function handleSaveOrClose() {
    if (busy) return;
    if (!canSave) {
      onClose();
      return;
    }
    setBusy(true);
    try {
      await persistIfNeeded();
      onClose();
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  async function handlePlay() {
    if (busy || trimmed.length === 0) return;
    setBusy(true);
    try {
      const current = await persistIfNeeded();
      // 换页到体验流程（同一个 overlay 槽位，会替换掉本弹层）
      openExperience(current, generateAction(current));
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    if (!confirm(`要把「${idea.text}」轻轻放下吗？删掉之后就找不回来啦。`)) return;
    setBusy(true);
    try {
      await deleteIdea(idea.id);
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

        <div className="flex items-center gap-[12px]">
          <div
            className="flex h-[44px] w-[44px] flex-none items-center justify-center rounded-[14px] text-[22px]"
            style={{ background: v.iconBg }}
          >
            {v.icon}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-[16px] font-bold text-ink">这颗念头</span>
            <span className="text-[12.5px] text-ink-faint">
              {idea.status === "tried" ? `已经玩过 ${idea.plays_count} 次` : "还想找时间试试"}
            </span>
          </div>
        </div>

        <div
          className="mt-[14px] rounded-[20px] bg-white p-[18px]"
          style={{
            border: "1.5px solid #d9e0cb",
            boxShadow: "0 4px 16px rgba(90,84,64,.06)",
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="想试试点什么呢…"
            rows={2}
            className="w-full resize-none bg-transparent text-[17px] leading-[1.5] text-ink outline-none placeholder:text-ink-faint"
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

        <button
          onClick={handlePlay}
          disabled={busy || trimmed.length === 0}
          className="mt-[22px] h-[56px] w-full rounded-full text-[17px] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--color-sage)", boxShadow: "var(--shadow-btn)" }}
        >
          今天就玩一下 🌿
        </button>

        <div className="mt-[14px] flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={busy}
            className="text-[13.5px] font-medium text-ink-faint"
          >
            删掉这个念头
          </button>
          <button
            onClick={handleSaveOrClose}
            disabled={busy || trimmed.length === 0}
            className="text-[14px] font-bold disabled:opacity-40"
            style={{ color: "var(--color-sage-text)" }}
          >
            {canSave ? "先存一下改动" : "改好了"}
          </button>
        </div>
      </div>
    </div>
  );
}
