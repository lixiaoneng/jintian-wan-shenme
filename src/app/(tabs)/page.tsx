"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-provider";
import { useAppState } from "@/lib/app-state";
import { getLatestExhibit, listIdeas } from "@/lib/storage";
import type { Idea } from "@/lib/types";
import {
  continuityLine,
  daysAgoLabel,
  generateAction,
  greetingForNow,
  pickRandomWantIdea,
} from "@/lib/recommend";
import { ideaVisual } from "@/lib/idea-visual";

type TodayPick = { ideaId: string; seed: number };

function todayKey() {
  const d = new Date();
  return `today-pick:${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function TodayPage() {
  const { userId, ready } = useSession();
  const { openExperience, openIdeaDetail, refreshKey } = useAppState();
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [pick, setPick] = useState<TodayPick | null>(null);
  const [continuity, setContinuity] = useState<string | null>(null);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    // 日期文案依赖 Intl 的本地时区，只能在挂载后于客户端计算，
    // 避免服务端预渲染时间和用户本地时间不一致导致的水合闪烁。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateLabel(
      new Date().toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    );
  }, []);

  useEffect(() => {
    if (!ready || !userId) return;
    listIdeas(userId)
      .then((data) => {
        setIdeas(data);
        const wantIdeas = data.filter((i) => i.status === "want");
        if (wantIdeas.length === 0) {
          setPick(null);
          return;
        }
        const raw =
          typeof window !== "undefined" ? localStorage.getItem(todayKey()) : null;
        if (raw) {
          try {
            const saved: TodayPick = JSON.parse(raw);
            if (wantIdeas.some((i) => i.id === saved.ideaId)) {
              setPick(saved);
              return;
            }
          } catch {
            // ignore malformed cache
          }
        }
        const idea = pickRandomWantIdea(wantIdeas);
        if (idea) {
          const next = { ideaId: idea.id, seed: 0 };
          localStorage.setItem(todayKey(), JSON.stringify(next));
          setPick(next);
        }
      })
      .catch(console.error);
    getLatestExhibit(userId)
      .then((entry) => {
        if (!entry) return;
        const label = daysAgoLabel(entry.activity.completed_at as string);
        if (label === "今天" || label === "昨天" || label.includes("天前")) {
          setContinuity(continuityLine(entry.idea.text, entry.reflectionText, label));
        }
      })
      .catch(console.error);
  }, [ready, userId, refreshKey]);

  function reroll() {
    if (!ideas) return;
    const wantIdeas = ideas.filter((i) => i.status === "want");
    const idea = pickRandomWantIdea(wantIdeas, pick?.ideaId);
    if (!idea) return;
    const next = { ideaId: idea.id, seed: (pick?.seed ?? 0) + 1 };
    localStorage.setItem(todayKey(), JSON.stringify(next));
    setPick(next);
  }

  const pickedIdea = ideas?.find((i) => i.id === pick?.ideaId) ?? null;
  const actionText = pickedIdea ? generateAction(pickedIdea, pick?.seed ?? 0) : "";
  const recentIdeas = (ideas ?? []).filter((i) => i.status === "want").slice(0, 4);

  return (
    <div className="flex flex-col px-[24px] pt-[16px]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] text-ink-secondary">{greetingForNow()}</span>
        <span className="text-[12px] tracking-[.06em] text-ink-secondary">{dateLabel}</span>
      </div>
      <div className="mt-[4px] text-[26px] font-bold leading-[1.3] text-ink">
        今天想玩什么？
      </div>

      {continuity && (
        <div
          className="mt-[16px] flex items-start gap-[8px] rounded-[18px] px-[16px] py-[13px]"
          style={{ background: "var(--color-sage-chip)" }}
        >
          <span className="text-[14px] leading-none">🌙</span>
          <span className="text-[14.5px] leading-[1.5]" style={{ color: "#5c6647" }}>
            {continuity}
          </span>
        </div>
      )}

      {pickedIdea ? (
        <div
          className="mt-[20px] rounded-[26px]"
          style={{
            background: "linear-gradient(135deg,#8a9a6d,#7d9068)",
            boxShadow: "var(--shadow-hero)",
            padding: "24px 22px",
          }}
        >
          <div
            className="text-[12px] font-semibold tracking-[.04em]"
            style={{ color: "rgba(255,255,255,.8)" }}
          >
            今天为你挑的一件小事
          </div>
          <div className="my-[12px] text-[21px] font-bold leading-[1.4] text-white">
            {actionText}
          </div>
          <div className="text-[13.5px] leading-[1.5]" style={{ color: "rgba(255,255,255,.82)" }}>
            从「{pickedIdea.text}」里拆出来的一小步～
          </div>
          <div className="mt-[18px] flex gap-[10px]">
            <button
              onClick={() => openExperience(pickedIdea, actionText)}
              className="h-[46px] flex-1 rounded-full text-[15px] font-bold"
              style={{ background: "#fff", color: "var(--color-sage-text)" }}
            >
              试试看
            </button>
            <button
              onClick={reroll}
              aria-label="换一换"
              className="flex h-[46px] w-[46px] items-center justify-center rounded-full text-[18px] font-semibold text-white"
              style={{ background: "rgba(255,255,255,.22)" }}
            >
              ⟳
            </button>
          </div>
        </div>
      ) : ideas ? (
        <div
          className="mt-[20px] rounded-[26px] p-[24px]"
          style={{ background: "var(--color-card-white)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="text-[16px] font-bold text-ink">还没有念头可以挑呢</div>
          <div className="mt-[8px] text-[14px] leading-[1.6] text-ink-secondary">
            点右下角的「+」，先随手记一个想试试的小事吧。
          </div>
        </div>
      ) : null}

      <div className="mb-[12px] mt-[26px] flex items-baseline justify-between">
        <span className="text-[16px] font-bold text-ink">最近种草</span>
        <Link href="/ideas" className="text-[13px] font-medium text-ink-faint">
          看全部 →
        </Link>
      </div>
      <div className="flex gap-[14px] overflow-x-auto pb-[8px]">
        {recentIdeas.map((idea) => {
          const v = ideaVisual(idea.text);
          return (
            <button
              key={idea.id}
              onClick={() => openIdeaDetail(idea)}
              className="flex w-[150px] flex-none flex-col rounded-[20px] p-[14px] text-left active:scale-[.98] transition-transform"
              style={{ background: v.bg, boxShadow: "var(--shadow-card)", minHeight: 132 }}
            >
              <div
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] text-[20px]"
                style={{ background: v.iconBg }}
              >
                {v.icon}
              </div>
              <div
                className="mt-[10px] text-[14.5px] font-bold leading-[1.35] text-ink"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {idea.text}
              </div>
              <div className="mt-auto pt-[10px] text-[12px] text-ink-faint">
                📅 {daysAgoLabel(idea.created_at)}种下
              </div>
            </button>
          );
        })}
        {recentIdeas.length === 0 && ideas && (
          <div className="py-[12px] text-[13.5px] text-ink-faint">
            先记下第一个念头吧～
          </div>
        )}
      </div>
      <div className="h-[120px] flex-none" />
    </div>
  );
}
