// 唯一的数据访问层：目前用 localStorage 持久化，接口保持异步，
// 以后要换成 Neon/Postgres 时，只要在这里换实现即可（页面/组件无需改动）。
//
// 数据模型（与产品概念一致）：
//   ideas       念头 / 种草
//   activities  一次「试试看」的体验
//   reflections 做完留一句 / 留给今天

import type { Activity, GrowthStage, Idea, IdeaTag, Reflection } from "./types";

// 单机版没有真正的登录，用一个固定用户占位，方便以后接多用户。
export const LOCAL_USER_ID = "local-user";

const LS_KEY = "jwsm-data:v1";

export function growthStageForPlays(plays: number): GrowthStage {
  if (plays <= 0) return "seed";
  if (plays <= 2) return "sprout";
  return "tree";
}

type DB = {
  ideas: Idea[];
  activities: Activity[];
  reflections: Reflection[];
};

function emptyDB(): DB {
  return { ideas: [], activities: [], reflections: [] };
}

function read(): DB {
  if (typeof window === "undefined") return emptyDB();
  const raw = window.localStorage.getItem(LS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DB;
    } catch {
      // 数据损坏就当作空库
    }
  }
  return emptyDB();
}

function write(db: DB) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(db));
}

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

// ============ demo 种子数据（首次打开自动写入） ============

function daysAgo(n: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function seedIdea(
  id: string,
  text: string,
  tag: IdeaTag,
  status: "want" | "tried",
  plays: number,
  createdDaysAgo: number
): Idea {
  return {
    id,
    user_id: LOCAL_USER_ID,
    text,
    tag,
    status,
    plays_count: plays,
    growth_stage: growthStageForPlays(plays),
    created_at: daysAgo(createdDaysAgo),
    updated_at: daysAgo(createdDaysAgo),
  };
}

function seedActivity(
  id: string,
  ideaId: string,
  actionText: string,
  completedDaysAgo: number
): Activity {
  return {
    id,
    user_id: LOCAL_USER_ID,
    idea_id: ideaId,
    action_text: actionText,
    started_at: daysAgo(completedDaysAgo, 9),
    completed_at: daysAgo(completedDaysAgo, 10),
    created_at: daysAgo(completedDaysAgo, 9),
  };
}

function seedReflection(
  id: string,
  activityId: string,
  ideaId: string,
  text: string,
  mood: string,
  completedDaysAgo: number
): Reflection {
  return {
    id,
    user_id: LOCAL_USER_ID,
    activity_id: activityId,
    idea_id: ideaId,
    type: "activity",
    text,
    mood,
    answers: null,
    created_at: daysAgo(completedDaysAgo, 10),
  };
}

function seed(): DB {
  const ideas: Idea[] = [
    seedIdea("d-suno", "用 Suno 做歌", "do", "tried", 2, 8),
    seedIdea("d-coffee", "学做手冲咖啡", "eat", "tried", 1, 6),
    seedIdea("d-exam", "准备成人自考", "learn", "tried", 1, 5),
    seedIdea("d-gym", "去健身房", "do", "tried", 3, 10),
    seedIdea("d-camping", "运营露营小助手群", "do", "tried", 1, 7),
    seedIdea("d-japan", "去日本", "go", "want", 0, 2),
    seedIdea("d-vibecoding", "做 vibe coding", "do", "want", 0, 1),
  ];

  const activities: Activity[] = [
    seedActivity("d-act-suno-1", "d-suno", "花 10 分钟随便生成一首歌", 6),
    seedActivity("d-act-suno-2", "d-suno", "又生成了一首更离谱的歌", 0),
    seedActivity("d-act-coffee", "d-coffee", "在家手冲了第一杯", 3),
    seedActivity("d-act-exam", "d-exam", "看了自考都有哪些科目", 2),
    seedActivity("d-act-gym", "d-gym", "去了趟健身房", 9),
    seedActivity("d-act-camping", "d-camping", "在群里发了第一条露营攻略", 5),
  ];

  const reflections: Reflection[] = [
    seedReflection("d-ref-suno-1", "d-act-suno-1", "d-suno", "比想象中好玩，AI 编的词还挺离谱", "还不错", 6),
    seedReflection("d-ref-suno-2", "d-act-suno-2", "d-suno", "又更离谱了，但我居然有点喜欢", "超喜欢", 0),
    seedReflection("d-ref-coffee", "d-act-coffee", "d-coffee", "有点酸，下次少放点粉", "还不错", 3),
    seedReflection("d-ref-exam", "d-act-exam", "d-exam", "没那么可怕，先报一门试试", "下次还想", 2),
    seedReflection("d-ref-gym", "d-act-gym", "d-gym", "其实没有那么可怕", "一般般", 9),
    seedReflection("d-ref-camping", "d-act-camping", "d-camping", "有人回应了，还挺开心", "超喜欢", 5),
  ];

  return { ideas, activities, reflections };
}

/** 首次打开且本地为空时，写入 demo 数据 */
export function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(LS_KEY)) write(seed());
}

/** 开发入口：重置成 demo 数据 */
export function resetDemoData() {
  write(seed());
}

/** 开发入口：清空所有本地数据 */
export function clearAllData() {
  write(emptyDB());
}

// ============ 数据访问接口（页面/组件只用这些） ============
// 说明：userId 参数暂时忽略（单机 localStorage），保留是为了以后接多用户时不用改调用处。

export async function listIdeas(_userId?: string): Promise<Idea[]> {
  return [...read().ideas].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createIdea(
  _userId: string,
  text: string,
  tag: IdeaTag | null
): Promise<Idea> {
  const db = read();
  const now = new Date().toISOString();
  const idea: Idea = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    text,
    tag,
    status: "want",
    plays_count: 0,
    growth_stage: "seed",
    created_at: now,
    updated_at: now,
  };
  db.ideas.unshift(idea);
  write(db);
  return idea;
}

export async function createActivity(
  _userId: string,
  ideaId: string,
  actionText: string
): Promise<Activity> {
  const db = read();
  const now = new Date().toISOString();
  const activity: Activity = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    idea_id: ideaId,
    action_text: actionText,
    started_at: now,
    completed_at: null,
    created_at: now,
  };
  db.activities.push(activity);
  write(db);
  return activity;
}

export async function completeActivity(activityId: string): Promise<Activity> {
  const db = read();
  const found = db.activities.find((a) => a.id === activityId);
  if (!found) throw new Error("activity not found: " + activityId);
  found.completed_at = new Date().toISOString();
  write(db);
  return found;
}

export async function bumpIdeaAfterPlay(idea: Idea): Promise<Idea> {
  const db = read();
  const found = db.ideas.find((i) => i.id === idea.id);
  if (!found) throw new Error("idea not found: " + idea.id);
  found.plays_count += 1;
  found.status = "tried";
  found.growth_stage = growthStageForPlays(found.plays_count);
  found.updated_at = new Date().toISOString();
  write(db);
  return found;
}

export async function createReflection(input: {
  userId?: string;
  activityId?: string | null;
  ideaId?: string | null;
  type: "activity" | "evening";
  text?: string | null;
  mood?: string | null;
  answers?: { q: string; text: string }[] | null;
}): Promise<Reflection> {
  const db = read();
  const reflection: Reflection = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    activity_id: input.activityId ?? null,
    idea_id: input.ideaId ?? null,
    type: input.type,
    text: input.text ?? null,
    mood: input.mood ?? null,
    answers: input.answers ?? null,
    created_at: new Date().toISOString(),
  };
  db.reflections.push(reflection);
  write(db);
  return reflection;
}

// 一件「藏品」：一次完成的体验 + 来自的念头 + 留下的一句话/心情
export type ExhibitEntry = {
  activity: Activity;
  idea: Idea;
  reflectionText: string | null;
  mood: string | null;
};

function buildExhibits(db: DB): ExhibitEntry[] {
  return db.activities
    .filter((a) => a.completed_at)
    .sort((a, b) => (b.completed_at as string).localeCompare(a.completed_at as string))
    .map((activity) => {
      const idea = db.ideas.find((i) => i.id === activity.idea_id) ?? null;
      const reflection = db.reflections.find(
        (r) => r.activity_id === activity.id && r.type === "activity"
      );
      return {
        activity,
        idea: idea as Idea,
        reflectionText: reflection?.text ?? null,
        mood: reflection?.mood ?? null,
      };
    })
    .filter((e) => e.idea);
}

export async function listExhibits(_userId?: string): Promise<ExhibitEntry[]> {
  return buildExhibits(read());
}

export async function getLatestExhibit(_userId?: string): Promise<ExhibitEntry | null> {
  return buildExhibits(read())[0] ?? null;
}
