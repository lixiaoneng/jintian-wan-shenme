"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/session-provider";
import { useAppState } from "@/lib/app-state";
import { listIdeas } from "@/lib/storage";
import type { Idea, IdeaStatus } from "@/lib/types";
import { daysAgoLabel } from "@/lib/recommend";
import { IdeaCover } from "@/components/IdeaCover";
import { GrowthBadge } from "@/components/GrowthBadge";

const FILTERS: { value: IdeaStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "want", label: "还想试" },
  { value: "tried", label: "试过了 ✿" },
];

export default function IdeasPage() {
  const { userId, ready } = useSession();
  const { refreshKey, openIdeaDetail } = useAppState();
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [filter, setFilter] = useState<IdeaStatus | "all">("all");

  useEffect(() => {
    if (!ready || !userId) return;
    listIdeas(userId).then(setIdeas).catch(console.error);
  }, [ready, userId, refreshKey]);

  const filtered = useMemo(() => {
    if (!ideas) return [];
    if (filter === "all") return ideas;
    return ideas.filter((i) => i.status === filter);
  }, [ideas, filter]);

  return (
    <div className="flex flex-col">
      <div className="flex-none px-[24px] pb-[14px] pt-[10px]">
        <div className="text-[26px] font-bold text-ink">最近种草</div>
        <div className="mt-[4px] text-[14px] text-ink-secondary">
          {ideas ? `${ideas.length} 个念头，慢慢来，不急着试完` : "读取中…"}
        </div>
        <div className="mt-[16px] flex gap-[9px]">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="rounded-full px-[16px] py-[8px] text-[13px]"
                style={
                  active
                    ? { background: "var(--color-sage)", color: "#fff", fontWeight: 700 }
                    : {
                        background: "#fff",
                        color: "rgba(58,54,45,.55)",
                        fontWeight: 600,
                        border: "1px solid rgba(0,0,0,.05)",
                      }
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-[20px]">
        {filtered.length === 0 && ideas && (
          <div className="mt-[40px] text-center text-[14px] leading-[1.7] text-ink-faint">
            这里还空空的，
            <br />
            点右下角「+」记一个念头试试～
          </div>
        )}
        <div className="grid grid-cols-2 gap-[14px]">
          {filtered.map((idea) => (
            <button
              key={idea.id}
              onClick={() => openIdeaDetail(idea)}
              className="overflow-hidden rounded-[20px] bg-white text-left active:scale-[.98] transition-transform"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <IdeaCover id={idea.id} height={100}>
                {idea.status === "tried" && (
                  <span
                    className="absolute right-[9px] top-[9px] rounded-full px-[9px] py-[3px] text-[11px] font-semibold text-white"
                    style={{ background: "var(--color-sage)" }}
                  >
                    ✿ 试过
                  </span>
                )}
              </IdeaCover>
              <div style={{ padding: "12px 13px" }}>
                <div className="text-[14.5px] font-bold leading-[1.35] text-ink">
                  {idea.text}
                </div>
                <div className="mt-[5px] flex items-center justify-between gap-[6px] text-[12px] text-ink-faint">
                  <span>
                    {daysAgoLabel(idea.created_at)}
                    {idea.status === "tried" ? ` · 试过 ${idea.plays_count} 次` : " · 还想试"}
                  </span>
                </div>
                {idea.status === "tried" && (
                  <div className="mt-[6px]">
                    <GrowthBadge stage={idea.growth_stage} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="h-[120px] flex-none" />
    </div>
  );
}
