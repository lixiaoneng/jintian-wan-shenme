import type { Idea, IdeaTag } from "./types";

// 第一版先用本地规则生成「今天一件小事」，
// 后续可以把 generateAction / pickTodayIdea 换成调用 MiniMax API 的版本。

const TEMPLATES_BY_TAG: Record<IdeaTag | "default", string[]> = {
  learn: [
    "花 10 分钟找一个关于「{text}」的入门内容看看",
    "花 10 分钟随便试一下「{text}」的第一步，不用学会",
  ],
  go: [
    "花 10 分钟查一下「{text}」怎么去，心里有个数就好",
    "花 10 分钟看看「{text}」的照片，想象一下自己在那儿",
  ],
  do: [
    "花 10 分钟先做「{text}」里最简单的一小步",
    "花 15 分钟随便试试「{text}」，不用做到完美",
  ],
  eat: [
    "花 10 分钟搜一下「{text}」的做法或者哪里能吃到",
    "花 15 分钟准备一下「{text}」需要的东西",
  ],
  default: [
    "花 10 分钟随便碰一下「{text}」，看看什么感觉",
    "花 15 分钟给「{text}」一个开始，不用做完",
  ],
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function generateAction(idea: Idea, seed = 0): string {
  const templates = TEMPLATES_BY_TAG[idea.tag ?? "default"] ?? TEMPLATES_BY_TAG.default;
  const index = (hashString(idea.id) + seed) % templates.length;
  return templates[index].replace("{text}", idea.text);
}

export function pickRandomWantIdea(ideas: Idea[], excludeId?: string): Idea | null {
  const pool = ideas.filter((i) => i.status === "want" && i.id !== excludeId);
  const finalPool = pool.length > 0 ? pool : ideas.filter((i) => i.status === "want");
  if (finalPool.length === 0) return null;
  const index = Math.floor(Math.random() * finalPool.length);
  return finalPool[index];
}

export function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 11) return "早上好呀 ☀︎";
  if (hour < 18) return "下午好呀 ☀︎";
  return "晚上好呀 🌙";
}

export function daysAgoLabel(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.setHours(0, 0, 0, 0) - new Date(then).setHours(0, 0, 0, 0);
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  return `${Math.floor(days / 7)} 周前`;
}

export function continuityLine(
  ideaText: string,
  reflectionText: string | null,
  daysAgo: string
): string {
  const timeWord = daysAgo === "今天" ? "刚才" : daysAgo;
  if (reflectionText) {
    return `${timeWord}你试了「${ideaText}」，说${reflectionText.length > 14 ? "感觉还不错" : `「${reflectionText}」`}。今天想接着玩玩看吗？`;
  }
  return `${timeWord}你试了「${ideaText}」。今天想接着玩玩看吗？`;
}
