export type IdeaTag = "learn" | "go" | "do" | "eat";

export const IDEA_TAGS: { value: IdeaTag; label: string }[] = [
  { value: "learn", label: "🌱 想学" },
  { value: "go", label: "✈︎ 想去" },
  { value: "do", label: "✦ 想做" },
  { value: "eat", label: "☕︎ 想吃" },
];

export type GrowthStage = "seed" | "sprout" | "tree";

export type IdeaStatus = "want" | "tried";

export type Idea = {
  id: string;
  user_id: string;
  text: string;
  tag: IdeaTag | null;
  status: IdeaStatus;
  plays_count: number;
  growth_stage: GrowthStage;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  idea_id: string;
  action_text: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

// 做完体验后留下的一句话（只剩这一种反思；「留给今天」已删除）
export type Reflection = {
  id: string;
  user_id: string;
  activity_id: string | null;
  idea_id: string | null;
  type: "activity";
  text: string | null;
  mood: string | null;
  created_at: string;
};

// 随手记：想到什么就记一条，可选地关联一个念头
export type Note = {
  id: string;
  user_id: string;
  text: string;
  idea_id: string | null;
  created_at: string;
  updated_at: string;
};
