import type { GrowthStage } from "@/lib/types";

// growth_stage 保留在数据库里，前端改用「藏品新鲜度」来表达，不再出现树/森林语言。
const STAGE_META: Record<GrowthStage, { label: string; fg: string; bg: string }> = {
  seed: { label: "想收藏", fg: "#a88a5a", bg: "#f2ebdb" },
  sprout: { label: "✦ 新鲜展品", fg: "#6f7d54", bg: "#eef0e4" },
  tree: { label: "🏛️ 常设馆藏", fg: "#4e7d5a", bg: "#e0ecdd" },
};

export function GrowthBadge({ stage }: { stage: GrowthStage }) {
  const meta = STAGE_META[stage];
  return (
    <span
      className="rounded-full px-[9px] py-[3px] text-[11px] font-semibold"
      style={{ color: meta.fg, background: meta.bg }}
    >
      {meta.label}
    </span>
  );
}
