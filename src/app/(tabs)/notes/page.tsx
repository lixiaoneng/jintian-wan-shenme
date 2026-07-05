"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/session-provider";
import { useAppState } from "@/lib/app-state";
import { listNotes } from "@/lib/storage";
import type { Note } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function preview(text: string, max = 46): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}

export default function NotesPage() {
  const { userId, ready } = useSession();
  const { refreshKey, openNoteDetail } = useAppState();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!ready || !userId) return;
    listNotes(userId).then(setNotes).catch(console.error);
  }, [ready, userId, refreshKey]);

  const filtered = useMemo(() => {
    if (!notes) return [];
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.text.toLowerCase().includes(q));
  }, [notes, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none px-[24px] pb-[8px] pt-[14px]">
        <div className="text-[26px] font-bold text-ink">随手记</div>
        <div className="mt-[3px] text-[13.5px] text-ink-secondary">
          想到就记一句，以后翻出来看看。
        </div>

        {/* 搜索 —— 这个页面最重要的功能 */}
        <div
          className="mt-[16px] flex items-center gap-[10px] rounded-full px-[16px]"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,.05)", height: 46 }}
        >
          <span className="text-[15px] text-ink-faint">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜点什么…比如 日本、Suno"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="清空搜索"
              className="text-[14px] text-ink-faint"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 一张张左右滑动的卡片 */}
      <div className="flex flex-1 flex-col justify-center">
        {notes && filtered.length === 0 ? (
          <div className="px-[36px] text-center text-[14px] leading-[1.8] text-ink-faint">
            {query
              ? "没找到这条，换个词试试～"
              : "还没有记过什么，\n点右下角「+」，想到什么记一下就好。"}
          </div>
        ) : (
          <div
            className="flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-[24px] pb-[8px]"
            style={{ scrollbarWidth: "none" }}
          >
            {filtered.map((note) => (
              <button
                key={note.id}
                onClick={() => openNoteDetail(note)}
                className="flex snap-center flex-col rounded-[24px] bg-white p-[22px] text-left active:scale-[.98] transition-transform"
                style={{
                  width: "78%",
                  minWidth: "78%",
                  minHeight: 220,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div
                  className="text-[13px] font-bold tracking-[.04em] text-ink-faint"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {formatDate(note.created_at)}
                </div>
                <div className="mt-[14px] text-[19px] font-medium leading-[1.55] text-ink">
                  {preview(note.text)}
                </div>
                {note.idea_id && (
                  <div className="mt-auto pt-[16px] text-[12.5px]" style={{ color: "var(--color-sage-text)" }}>
                    🌱 从一个念头长出来的
                  </div>
                )}
              </button>
            ))}
            {/* 结尾留白，最后一张能滑到中间 */}
            <div className="flex-none" style={{ width: "12%" }} />
          </div>
        )}

        {notes && filtered.length > 1 && (
          <div className="mt-[16px] text-center text-[12px] text-ink-faint">
            ← 左右滑，翻一翻以前记过的 →
          </div>
        )}
      </div>

      <div className="h-[110px] flex-none" />
    </div>
  );
}
