"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/session-provider";
import { useAppState } from "@/lib/app-state";
import { listExhibits, type ExhibitEntry } from "@/lib/storage";
import { daysAgoLabel } from "@/lib/recommend";
import type { Idea, IdeaTag } from "@/lib/types";
import { DevDataControls } from "@/components/DevDataControls";

const TAG_EMOJI: Record<IdeaTag, string> = {
  learn: "📖",
  go: "🧳",
  do: "✦",
  eat: "🍽️",
};

// 按念头内容挑一个更专属的小图标，挑不到就退回分类 emoji
const KEYWORD_EMOJI: [RegExp, string][] = [
  [/suno|歌|音乐|唱/i, "🎵"],
  [/咖啡|手冲/, "☕️"],
  [/自考|考试|读书|学习/, "📚"],
  [/健身|健身房|跑步|运动/, "💪"],
  [/日本|东京|京都|旅行|去日本/, "🇯🇵"],
  [/露营|营地|户外/, "🏕️"],
  [/coding|代码|编程|vibe/i, "🤖"],
  [/画|绘/, "🎨"],
  [/花|植物/, "🌼"],
];

function exhibitEmoji(idea: Idea): string {
  for (const [re, emoji] of KEYWORD_EMOJI) {
    if (re.test(idea.text)) return emoji;
  }
  return TAG_EMOJI[idea.tag as IdeaTag] ?? "🖼️";
}

// 展品标题：像展签，而不是任务记录。第一次 vs 第 N 次。
function exhibitTitle(ideaText: string, ordinal: number): string {
  if (ordinal <= 1) return `第一次碰了碰：${ideaText}`;
  return `第 ${ordinal} 次试了试：${ideaText}`;
}

const DEFAULT_REFLECTION = "这件小事真的发生过。";

const MOOD_TAG_STYLE: Record<string, { fg: string; bg: string }> = {
  超喜欢: { fg: "#c46a58", bg: "#f6e4df" },
  还不错: { fg: "#6f7d54", bg: "#eef0e4" },
  一般般: { fg: "#8a8578", bg: "#efeae0" },
  下次还想: { fg: "#b08535", bg: "#f5ecd8" },
};

// 博物馆立面剪影：门楣 + 立柱
function MuseumFacade() {
  const color = "#cbb98d";
  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
      {/* 门楣 */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "70px solid transparent",
          borderRight: "70px solid transparent",
          borderBottom: `26px solid ${color}`,
        }}
      />
      {/* 檐 */}
      <div style={{ width: 150, height: 8, background: color }} />
      {/* 立柱 */}
      <div className="flex" style={{ gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: 9, height: 44, background: color }} />
        ))}
      </div>
      {/* 台基 */}
      <div style={{ width: 190, height: 12, background: color }} />
    </div>
  );
}

export default function MuseumPage() {
  const { userId, ready } = useSession();
  const { refreshKey } = useAppState();
  const [entries, setEntries] = useState<ExhibitEntry[] | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    listExhibits(userId).then(setEntries).catch(console.error);
  }, [ready, userId, refreshKey]);

  const monthCount = useMemo(() => {
    if (!entries) return 0;
    const now = new Date();
    return entries.filter((e) => {
      const d = new Date(e.activity.completed_at as string);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [entries]);

  // 每件藏品在「它所属念头」里是第几次体验（按时间从早到晚数）。
  // 列表按时间倒序，所以从后往前遍历、逐念头累加，得到 1、2、3…
  const ordinalByActivityId = useMemo(() => {
    const map = new Map<string, number>();
    const countByIdea = new Map<string, number>();
    for (let i = (entries?.length ?? 0) - 1; i >= 0; i--) {
      const e = entries![i];
      const next = (countByIdea.get(e.idea.id) ?? 0) + 1;
      countByIdea.set(e.idea.id, next);
      map.set(e.activity.id, next);
    }
    return map;
  }, [entries]);

  const total = entries?.length ?? 0;

  return (
    <div className="flex flex-col">
      <div
        className="relative flex-none overflow-hidden"
        style={{
          height: 250,
          background: "linear-gradient(180deg,#efe9dc 0%,#eadfc9 58%,#e3d4b8 100%)",
        }}
      >
        <div
          className="animate-breathe absolute right-[34px] top-[26px] h-[38px] w-[38px] rounded-full"
          style={{ background: "#f0c98a", boxShadow: "0 0 28px rgba(233,200,119,.6)" }}
        />
        <div className="absolute left-[26px] top-[28px] text-[26px] font-bold leading-[1.25] text-ink">
          🏛️ 煊煊博物馆
        </div>
        <div className="absolute left-[26px] top-[70px] text-[14px] leading-[1.5] text-ink-secondary">
          每一次好奇，都值得被收藏。
        </div>
        <div
          className="absolute left-[26px] top-[100px] inline-flex items-center rounded-full px-[12px] py-[5px] text-[12.5px] font-semibold"
          style={{ background: "rgba(255,255,255,.6)", color: "#9a7d43" }}
        >
          本月馆藏 {monthCount} 件
        </div>
        <MuseumFacade />
      </div>

      <div className="px-[24px] pt-[20px]">
        <div className="mb-[6px] flex items-baseline justify-between">
          <span className="text-[16px] font-bold text-ink">正在展出 🖼️</span>
          {total > 0 && (
            <span className="text-[12px] text-ink-faint">共 {total} 件藏品</span>
          )}
        </div>
        <div className="mb-[14px] text-[12.5px] text-ink-faint">
          这些都是你认真生活过的证据
        </div>

        {entries && entries.length === 0 && (
          <div
            className="mt-[20px] rounded-[20px] p-[22px] text-center text-[14px] leading-[1.8] text-ink-secondary"
            style={{ background: "var(--color-card-white)", boxShadow: "var(--shadow-card)" }}
          >
            博物馆还在布展中 🚧
            <br />
            等煊煊试过第一件新鲜事，
            <br />
            这里就会出现第一件藏品。
          </div>
        )}

        <div className="flex flex-col gap-[14px]">
          {entries?.map((entry, index) => {
            const collectionNo = String(total - index).padStart(3, "0");
            const ordinal = ordinalByActivityId.get(entry.activity.id) ?? 1;
            const isFirst = ordinal <= 1;
            const moodStyle = entry.mood ? MOOD_TAG_STYLE[entry.mood] : null;
            return (
              <div
                key={entry.activity.id}
                className="overflow-hidden rounded-[20px] bg-white"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* 展牌顶栏 */}
                <div
                  className="flex items-center justify-between px-[16px] py-[8px]"
                  style={{ background: "#f7f2e8" }}
                >
                  <span
                    className="text-[11px] font-bold tracking-[.08em]"
                    style={{ color: "#b39a5f", fontFamily: "var(--font-nunito)" }}
                  >
                    馆藏 No.{collectionNo}
                  </span>
                  <span className="text-[11.5px] text-ink-faint">
                    {daysAgoLabel(entry.activity.completed_at as string)}入馆
                  </span>
                </div>

                <div className="flex items-start gap-[14px] px-[16px] py-[15px]">
                  <div
                    className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[14px] text-[22px]"
                    style={{ background: "var(--color-sage-chip)" }}
                  >
                    {exhibitEmoji(entry.idea)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold leading-[1.35] text-ink">
                      {exhibitTitle(entry.idea.text, ordinal)}
                    </div>
                    <div className="mt-[4px] text-[13px] leading-[1.55] text-ink-secondary">
                      「{entry.reflectionText ?? DEFAULT_REFLECTION}」
                    </div>
                    <div className="mt-[9px] flex flex-wrap gap-[6px]">
                      {isFirst && (
                        <span
                          className="rounded-full px-[9px] py-[3px] text-[11px] font-semibold"
                          style={{ color: "#9a7d43", background: "#f5ecd8" }}
                        >
                          第一次
                        </span>
                      )}
                      {entry.mood && (
                        <span
                          className="rounded-full px-[9px] py-[3px] text-[11px] font-semibold"
                          style={{
                            color: moodStyle?.fg ?? "#6f7d54",
                            background: moodStyle?.bg ?? "#eef0e4",
                          }}
                        >
                          {entry.mood}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DevDataControls />
      </div>
      <div className="h-[100px] flex-none" />
    </div>
  );
}
