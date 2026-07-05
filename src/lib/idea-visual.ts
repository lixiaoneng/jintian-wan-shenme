// 本地规则：根据念头文字推断一个小图标 + 一套极淡的主题配色。
// 全部本地推断，不依赖 AI；以后要接模型，替换 guessIcon / guessTheme 即可。

export type IdeaTheme = {
  bg: string; // 卡片背景（极淡，~5-8% 饱和）
  iconBg: string; // 图标底
  accent: string; // 强调色（次要文字用）
};

type Category =
  | "coffee"
  | "music"
  | "ai"
  | "travel"
  | "camping"
  | "study"
  | "fitness"
  | "art"
  | "food"
  | "plant"
  | "write"
  | "default";

// 顺序即优先级：越靠前越先匹配（解决「抹茶拿铁」这类重叠）
const RULES: { cat: Category; icon: string; re: RegExp }[] = [
  { cat: "coffee", icon: "☕", re: /咖啡|拿铁|手冲|美式|摩卡|卡布|咖啡豆|espresso|latte/i },
  { cat: "music", icon: "🎵", re: /音乐|唱歌|歌词|做歌|写歌|听歌|吉他|尤克里里|钢琴|乐器|编曲|弹琴|suno/i },
  { cat: "ai", icon: "🤖", re: /\bai\b|claude|cursor|chatgpt|gpt|大模型|vibe\s*coding|编程|代码|写代码|程序|prompt/i },
  { cat: "travel", icon: "✈️", re: /日本|东京|京都|旅行|旅游|出去玩|出发|机票|出国|海边|看海|自驾|环岛|签证|背包/ },
  { cat: "camping", icon: "🏕️", re: /露营|帐篷|营地|户外|徒步|野餐|登山|钓鱼/ },
  { cat: "study", icon: "📚", re: /学习|自考|读书|课程|考试|看书|上课|背单词|英语|考研|证书|听课/ },
  { cat: "fitness", icon: "💪", re: /运动|健身|跑步|瑜伽|游泳|骑车|减脂|撸铁|力量|拉伸|锻炼/ },
  { cat: "art", icon: "🎨", re: /画画|绘画|手工|陶艺|摄影|拍照|设计|涂鸦|黏土|插画|水彩|手账/ },
  { cat: "food", icon: "🍰", re: /做饭|做菜|烘焙|蛋糕|甜点|面包|抹茶|奶茶|料理|美食|吃/ },
  { cat: "plant", icon: "🌱", re: /植物|养花|种花|多肉|园艺|绿植|花草/ },
  { cat: "write", icon: "✍️", re: /写作|日记|写字|记录|博客|公众号|文章/ },
];

const THEMES: Record<Category, IdeaTheme> = {
  coffee: { bg: "#f3ece1", iconBg: "#e6d6bd", accent: "#997a4e" },
  music: { bg: "#efedf6", iconBg: "#ddd6ee", accent: "#79709c" },
  ai: { bg: "#e9f1f7", iconBg: "#d2e2f0", accent: "#5a7d9c" },
  travel: { bg: "#e6f1ee", iconBg: "#cde5df", accent: "#4d8175" },
  camping: { bg: "#eef1e5", iconBg: "#dbe4c7", accent: "#6f7d54" },
  study: { bg: "#f5efdc", iconBg: "#ecdfbe", accent: "#9a8433" },
  fitness: { bg: "#f8ece7", iconBg: "#f1d7cd", accent: "#bf6f57" },
  art: { bg: "#f6eae9", iconBg: "#eed3cf", accent: "#b2756c" },
  food: { bg: "#f6ece5", iconBg: "#efdcc7", accent: "#b07f4f" },
  plant: { bg: "#ecf1e6", iconBg: "#d6e4c7", accent: "#6f8556" },
  write: { bg: "#eef0ee", iconBg: "#dbe0da", accent: "#6d7a6b" },
  default: { bg: "#eef1e6", iconBg: "#dde5c9", accent: "#6f7d54" },
};

function guessCategory(text: string): Category {
  const t = text ?? "";
  for (const rule of RULES) {
    if (rule.re.test(t)) return rule.cat;
  }
  return "default";
}

export function guessIcon(text: string): string {
  const cat = guessCategory(text);
  return RULES.find((r) => r.cat === cat)?.icon ?? "💭";
}

export function guessTheme(text: string): IdeaTheme {
  return THEMES[guessCategory(text)];
}

// 便捷：一次拿到图标 + 配色
export function ideaVisual(text: string): IdeaTheme & { icon: string } {
  return { ...guessTheme(text), icon: guessIcon(text) };
}
