# 今天玩什么

一个轻轻接住每个念头的小伙伴 —— 不是待办清单，是「今天想试试什么」。移动端优先，温柔轻盈。
每一次好奇，都会被收进 **🏛️ 煊煊博物馆**。

## 第一版：纯 localStorage，零后端
当前版本**不依赖任何后端 / 数据库 / 环境变量**，所有数据存在浏览器 localStorage，
`npm run dev` 打开即用，也能直接部署到 Vercel。首次打开若本地为空，会自动写入一组
「煊煊专属」demo 数据（Suno 做歌 / 手冲咖啡 / 成人自考 / 健身房 / 露营小助手群 / 去日本 / vibe coding），
方便立刻看到完整效果。

> 数据访问层集中在 `src/lib/storage.ts`，接口保持异步。以后要换成 **Neon / Postgres**
> 时，只改这一个文件即可，页面和组件无需改动。

## 技术栈
- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- 数据：浏览器 localStorage（第一版）
- 部署目标：Vercel

## 本地开发
```bash
npm install
npm run dev
```
无需 `.env.local`。打开 http://localhost:3000 即可。

## 目录结构
```
src/
  app/
    (tabs)/
      layout.tsx        # 4-Tab 外壳：底部导航 + FAB + 浮层
      page.tsx           # 今天（首页）
      ideas/page.tsx      # 最近种草
      evening/page.tsx    # 留给今天
      forest/page.tsx     # 🏛️ 煊煊博物馆（路由沿用 /forest）
    layout.tsx            # 根布局，字体、SessionProvider
    globals.css           # 设计 token（颜色/圆角/阴影/动画）
  components/
    BottomNav.tsx / Fab.tsx
    SparkSheet.tsx         # 灵光一闪快速输入浮层
    ExperienceOverlay.tsx  # 试试看 + 做完留一句
    IdeaCover.tsx / GrowthBadge.tsx
    DevDataControls.tsx    # 底部隐藏的「重置 / 清空本地数据」入口
  lib/
    storage.ts             # ⭐ 唯一数据访问层（localStorage）+ demo 种子数据 + 重置/清空
    session-provider.tsx    # 提供固定本地用户 + 首次打开写入 demo 数据
    recommend.ts           # 本地规则：今日推荐 + 小行动拆解 + 问候语
    app-state.tsx           # 浮层状态 + 刷新信号
    types.ts
supabase/schema.sql         # 仅供参考：未来接 Postgres 时的表结构
supabase/seed.sql           # 仅供参考：未来接 Postgres 时的测试数据
```

## 数据模型
- `ideas` 念头/种草：`text, tag, status(want/tried), plays_count, growth_stage(seed/sprout/tree)`
- `activities` 一次「试试看」体验：`idea_id, action_text, started_at, completed_at`
- `reflections` 留一句 / 留给今天：`activity_id, idea_id, type(activity/evening), text, mood, answers`

「🏛️ 煊煊博物馆」页面不单独存表，而是由 `activities`（已完成）join `ideas`、`reflections` 实时推导。
一次完成的体验 = 一件「藏品」。`growth_stage` 表示藏品新鲜度，前端不展示树/森林语言。

## 重置 / 清空数据
博物馆页面最底部有两个低调入口：**重置 demo 数据**、**清空本地数据**（也可在浏览器
localStorage 删掉 `jwsm-data:v1` 这个 key）。

## 第一版范围
- 今天 / 灵光一闪 / 最近种草 / 试试看 + 做完留一句 / 🏛️ 博物馆 / 4-Tab 导航
- 「留给今天」极简版（3 个固定轮换问题，可留空提交）
- 「今天一件小事」用本地规则生成（`src/lib/recommend.ts`），未接入 MiniMax
- MiniMax 预留位：`.env.local.example` 里的 `MINIMAX_API_KEY` / `MINIMAX_API_HOST`

## 部署到 Vercel
1. 推送到 Git 仓库，在 Vercel 导入项目
2. 无需配置任何环境变量
3. Build Command / Output 用默认值即可（Next.js 自动识别）

## 未来切到 Neon / Postgres
只需把 `src/lib/storage.ts` 里的读写实现换成对数据库的调用（接口签名保持不变），
并在 `session-provider.tsx` 里接入真实用户身份即可。`supabase/schema.sql` 可作为建表参考。
