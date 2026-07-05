// 唯一的数据访问层：目前用 localStorage 持久化，接口保持异步，
// 以后要换成 Neon/Postgres 时，只要在这里换实现即可（页面/组件无需改动）。
//
// 数据模型（与产品概念一致）：
//   ideas       念头 / 种草
//   activities  一次「试试看」的体验
//   reflections 做完留一句
//   notes       随手记（想到什么记一条）

import type { Activity, GrowthStage, Idea, IdeaTag, Note, Reflection } from "./types";

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
  notes: Note[];
};

function emptyDB(): DB {
  return { ideas: [], activities: [], reflections: [], notes: [] };
}

function read(): DB {
  if (typeof window === "undefined") return emptyDB();
  const raw = window.localStorage.getItem(LS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<DB>;
      // 与默认结构合并，兼容早期没有 notes 字段的本地数据
      return { ...emptyDB(), ...parsed };
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
    created_at: daysAgo(completedDaysAgo, 10),
  };
}

function seedNote(
  id: string,
  text: string,
  ideaId: string | null,
  createdDaysAgo: number
): Note {
  return {
    id,
    user_id: LOCAL_USER_ID,
    text,
    idea_id: ideaId,
    created_at: daysAgo(createdDaysAgo, 14),
    updated_at: daysAgo(createdDaysAgo, 14),
  };
}

function seed(): DB {
  const ideas: Idea[] = [
    // 已经试过的（会进博物馆）
    seedIdea("d-suno", "用 Suno 做歌", "do", "tried", 2, 8),
    seedIdea("d-coffee", "学做手冲咖啡", "eat", "tried", 1, 6),
    seedIdea("d-exam", "准备成人自考", "learn", "tried", 1, 5),
    seedIdea("d-gym", "去健身房", "do", "tried", 1, 10),
    seedIdea("d-camping", "运营露营小助手群", "do", "tried", 1, 7),
    // 还没试过的（≥3 条，可被今日推荐抽中）
    seedIdea("d-japan", "去日本", "go", "want", 0, 2),
    seedIdea("d-vibecoding", "做 vibe coding", "do", "want", 0, 1),
    seedIdea("d-pottery", "去玩一次陶艺", "do", "want", 0, 3),
  ];

  const activities: Activity[] = [
    seedActivity("d-act-suno-1", "d-suno", "花 10 分钟随便生成一首歌", 6),
    seedActivity("d-act-suno-2", "d-suno", "又生成了一首更离谱的歌", 0),
    seedActivity("d-act-coffee", "d-coffee", "在家手冲了第一杯", 3),
    seedActivity("d-act-exam", "d-exam", "看了自考都有哪些科目", 2),
    seedActivity("d-act-gym", "d-gym", "去了趟健身房", 9),
    seedActivity("d-act-camping", "d-camping", "在群里发了第一条露营攻略", 5),
  ];

  // 注意：故意让「去健身房」这条完成活动没有 reflection，
  // 用来验证博物馆在无留言时会显示默认句「这件小事真的发生过。」
  const reflections: Reflection[] = [
    seedReflection("d-ref-suno-1", "d-act-suno-1", "d-suno", "比想象中好玩，AI 编的词还挺离谱", "还不错", 6),
    seedReflection("d-ref-suno-2", "d-act-suno-2", "d-suno", "又更离谱了，但我居然有点喜欢", "超喜欢", 0),
    seedReflection("d-ref-coffee", "d-act-coffee", "d-coffee", "有点酸，下次少放点粉", "还不错", 3),
    seedReflection("d-ref-exam", "d-act-exam", "d-exam", "没那么可怕，先报一门试试", "下次还想", 2),
    seedReflection("d-ref-camping", "d-act-camping", "d-camping", "有人回应了，还挺开心", "超喜欢", 5),
  ];

  // 随手记：一部分关联到念头（详情里会显示「🌱 来自」），一部分是普通记录
  const notes: Note[] = [
    seedNote("d-note-coffee", "今天突然觉得想学做手冲咖啡，最近老想喝一杯自己冲的。", "d-coffee", 0),
    seedNote("d-note-suno", "看到别人用 Suno 做歌，好神奇，改天也想自己瞎编一首。", "d-suno", 1),
    seedNote("d-note-japan", "以后想去日本看看，尤其是京都的秋天，据说很好看。", "d-japan", 2),
    seedNote("d-note-plant", "刚路过一家花店，想在家养点很好活的小植物。", null, 3),
    seedNote("d-note-quote", "看到一句话：慢慢来，比较快。想记下来提醒自己。", null, 5),
    seedNote("d-note-camping", "把露营装备清单整理一下，下次说走就走。", "d-camping", 7),
  ];

  return { ideas, activities, reflections, notes };
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

export async function updateIdea(
  id: string,
  patch: { text?: string; tag?: IdeaTag | null }
): Promise<Idea> {
  const db = read();
  const found = db.ideas.find((i) => i.id === id);
  if (!found) throw new Error("idea not found: " + id);
  if (patch.text !== undefined) found.text = patch.text;
  if (patch.tag !== undefined) found.tag = patch.tag;
  found.updated_at = new Date().toISOString();
  write(db);
  return found;
}

/** 删除一个念头，并级联删掉它相关的体验和留言，避免博物馆出现悬空藏品。 */
export async function deleteIdea(id: string): Promise<void> {
  const db = read();
  const activityIds = db.activities.filter((a) => a.idea_id === id).map((a) => a.id);
  db.ideas = db.ideas.filter((i) => i.id !== id);
  db.activities = db.activities.filter((a) => a.idea_id !== id);
  db.reflections = db.reflections.filter(
    (r) => r.idea_id !== id && !(r.activity_id && activityIds.includes(r.activity_id))
  );
  write(db);
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
  text?: string | null;
  mood?: string | null;
}): Promise<Reflection> {
  const db = read();
  const reflection: Reflection = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    activity_id: input.activityId ?? null,
    idea_id: input.ideaId ?? null,
    type: "activity",
    text: input.text ?? null,
    mood: input.mood ?? null,
    created_at: new Date().toISOString(),
  };
  db.reflections.push(reflection);
  write(db);
  return reflection;
}

// 从博物馆取下一件藏品：删掉这次体验 + 它的留言，并把念头的「试过次数」同步减 1。
export async function deleteActivity(activityId: string): Promise<void> {
  const db = read();
  const activity = db.activities.find((a) => a.id === activityId);
  if (!activity) return;
  db.activities = db.activities.filter((a) => a.id !== activityId);
  db.reflections = db.reflections.filter((r) => r.activity_id !== activityId);
  const idea = db.ideas.find((i) => i.id === activity.idea_id);
  if (idea) {
    idea.plays_count = Math.max(0, idea.plays_count - 1);
    idea.growth_stage = growthStageForPlays(idea.plays_count);
    if (idea.plays_count === 0) idea.status = "want";
    idea.updated_at = new Date().toISOString();
  }
  write(db);
}

// ============ 随手记 notes ============

export async function getIdea(id: string): Promise<Idea | null> {
  return read().ideas.find((i) => i.id === id) ?? null;
}

export async function listNotes(_userId?: string): Promise<Note[]> {
  return [...read().notes].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createNote(
  text: string,
  ideaId: string | null = null
): Promise<Note> {
  const db = read();
  const now = new Date().toISOString();
  const note: Note = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    text,
    idea_id: ideaId,
    created_at: now,
    updated_at: now,
  };
  db.notes.unshift(note);
  write(db);
  return note;
}

export async function updateNote(id: string, text: string): Promise<Note> {
  const db = read();
  const found = db.notes.find((n) => n.id === id);
  if (!found) throw new Error("note not found: " + id);
  found.text = text;
  found.updated_at = new Date().toISOString();
  write(db);
  return found;
}

export async function deleteNote(id: string): Promise<void> {
  const db = read();
  db.notes = db.notes.filter((n) => n.id !== id);
  write(db);
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
