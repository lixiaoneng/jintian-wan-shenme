-- 可选：给「真实 Supabase」灌入一组「煊煊专属」测试数据。
-- 说明：没有配置 Supabase 时，网页会自动进入本地 demo 模式（数据存浏览器 localStorage，
--       已内置同一套测试数据），无需执行本文件。
--
-- 使用方法：
-- 1. 先在网页里用匿名身份打开一次，让 Supabase 生成你的匿名用户。
-- 2. 在 SQL Editor 里执行 `select id, created_at from auth.users order by created_at desc;`
--    找到你的 user id。
-- 3. 把下面的 :uid 替换成那个 uuid（保留引号），再整段执行。

do $$
declare
  uid uuid := '00000000-0000-0000-0000-000000000000'::uuid; -- ← 换成你的 user id
  suno uuid; coffee uuid; exam uuid; gym uuid; camping uuid;
  a_suno1 uuid; a_suno2 uuid; a_coffee uuid; a_exam uuid; a_gym uuid; a_camping uuid;
begin
  -- 念头 / 种草
  insert into public.ideas (user_id, text, tag, status, plays_count, growth_stage, created_at)
  values (uid, '用 Suno 做歌', 'do', 'tried', 2, 'sprout', now() - interval '8 days') returning id into suno;
  insert into public.ideas (user_id, text, tag, status, plays_count, growth_stage, created_at)
  values (uid, '学做手冲咖啡', 'eat', 'tried', 1, 'sprout', now() - interval '6 days') returning id into coffee;
  insert into public.ideas (user_id, text, tag, status, plays_count, growth_stage, created_at)
  values (uid, '准备成人自考', 'learn', 'tried', 1, 'sprout', now() - interval '5 days') returning id into exam;
  insert into public.ideas (user_id, text, tag, status, plays_count, growth_stage, created_at)
  values (uid, '去健身房', 'do', 'tried', 3, 'tree', now() - interval '10 days') returning id into gym;
  insert into public.ideas (user_id, text, tag, status, plays_count, growth_stage, created_at)
  values (uid, '运营露营小助手群', 'do', 'tried', 1, 'sprout', now() - interval '7 days') returning id into camping;
  insert into public.ideas (user_id, text, tag, status, created_at)
  values (uid, '去日本', 'go', 'want', now() - interval '2 days');
  insert into public.ideas (user_id, text, tag, status, created_at)
  values (uid, '做 vibe coding', 'do', 'want', now() - interval '1 days');

  -- 体验（藏品）
  insert into public.activities (user_id, idea_id, action_text, started_at, completed_at)
  values (uid, suno, '花 10 分钟随便生成一首歌', now() - interval '6 days', now() - interval '6 days') returning id into a_suno1;
  insert into public.activities (user_id, idea_id, action_text, started_at, completed_at)
  values (uid, suno, '又生成了一首更离谱的歌', now(), now()) returning id into a_suno2;
  insert into public.activities (user_id, idea_id, action_text, started_at, completed_at)
  values (uid, coffee, '在家手冲了第一杯', now() - interval '3 days', now() - interval '3 days') returning id into a_coffee;
  insert into public.activities (user_id, idea_id, action_text, started_at, completed_at)
  values (uid, exam, '看了自考都有哪些科目', now() - interval '2 days', now() - interval '2 days') returning id into a_exam;
  insert into public.activities (user_id, idea_id, action_text, started_at, completed_at)
  values (uid, gym, '去了趟健身房', now() - interval '9 days', now() - interval '9 days') returning id into a_gym;
  insert into public.activities (user_id, idea_id, action_text, started_at, completed_at)
  values (uid, camping, '在群里发了第一条露营攻略', now() - interval '5 days', now() - interval '5 days') returning id into a_camping;

  -- 做完留一句
  insert into public.reflections (user_id, activity_id, idea_id, type, text, mood) values
    (uid, a_suno1, suno, 'activity', '比想象中好玩，AI 编的词还挺离谱', '还不错'),
    (uid, a_suno2, suno, 'activity', '又更离谱了，但我居然有点喜欢', '超喜欢'),
    (uid, a_coffee, coffee, 'activity', '有点酸，下次少放点粉', '还不错'),
    (uid, a_exam, exam, 'activity', '没那么可怕，先报一门试试', '下次还想'),
    (uid, a_gym, gym, 'activity', '其实没有那么可怕', '一般般'),
    (uid, a_camping, camping, 'activity', '有人回应了，还挺开心', '超喜欢');
end $$;
