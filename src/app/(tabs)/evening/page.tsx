"use client";

import { useMemo, useState } from "react";
import { useSession } from "@/lib/session-provider";
import { createReflection } from "@/lib/storage";

const QUESTION_POOL = [
  { color: "#c98a7a", q: "今天有什么开心的？" },
  { color: "#8a9a6d", q: "今天有没有什么新发现？" },
  { color: "#c9a86a", q: "有什么想留给未来的自己？" },
  { color: "#6f7d54", q: "今天有没有一件小事，值得被记住？" },
  { color: "#a9b58a", q: "有没有什么，明天想接着做？" },
];

function questionsForToday() {
  const d = new Date();
  const dayIndex = Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
      Date.UTC(d.getFullYear(), 0, 0)) /
      86400000
  );
  const start = dayIndex % QUESTION_POOL.length;
  return [0, 1, 2].map((i) => QUESTION_POOL[(start + i) % QUESTION_POOL.length]);
}

export default function EveningPage() {
  const { userId } = useSession();
  const questions = useMemo(() => questionsForToday(), []);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");

  async function handleSubmit() {
    if (!userId || state === "submitting") return;
    setState("submitting");
    const filled = questions
      .map((item) => ({ q: item.q, text: (answers[item.q] ?? "").trim() }))
      .filter((a) => a.text.length > 0);
    try {
      await createReflection({
        userId,
        type: "evening",
        answers: filled.length > 0 ? filled : null,
      });
      setState("done");
    } catch (e) {
      console.error(e);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-[30px] text-center">
        <div className="animate-grow-in text-[40px]">🌙</div>
        <div className="mt-[16px] text-[19px] font-bold text-ink">今天先到这里</div>
        <div className="mt-[8px] text-[14px] leading-[1.6] text-ink-secondary">
          留给未来的自己了，晚安～
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        className="relative flex-none overflow-hidden"
        style={{
          height: 130,
          background: "linear-gradient(180deg,#e4dce4 0%,#e9e0d6 55%,#eee6d6 100%)",
        }}
      >
        <div
          className="animate-sink absolute right-[36px] top-[28px] h-[46px] w-[46px] rounded-full"
          style={{ background: "radial-gradient(#f0c98a,#e6a86a)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 flex h-[54px] items-end justify-around px-[12px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-sway"
              style={{
                width: 0,
                height: 0,
                borderLeft: `${9 + (i % 2) * 4}px solid transparent`,
                borderRight: `${9 + (i % 2) * 4}px solid transparent`,
                borderBottom: `${28 + (i % 3) * 8}px solid ${
                  i % 2 === 0 ? "#8a9a6d" : "#9aac78"
                }`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="px-[24px] pt-[20px]">
        <div className="text-[22px] font-bold text-ink">今天过得怎么样？</div>
        <div className="mt-[6px] text-[14px] leading-[1.6] text-ink-secondary">
          慢慢来，想到什么写什么。空着也没关系。
        </div>

        <div className="mt-[20px] flex flex-col gap-[14px]">
          {questions.map((item) => (
            <div
              key={item.q}
              className="rounded-[20px] p-[16px]"
              style={{ background: "rgba(255,255,255,.7)" }}
            >
              <div className="text-[13.5px] font-bold" style={{ color: item.color }}>
                {item.q}
              </div>
              <textarea
                value={answers[item.q] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [item.q]: e.target.value }))
                }
                placeholder="写点什么…"
                rows={1}
                className="mt-[8px] w-full resize-none bg-transparent text-[14.5px] leading-[1.6] text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={state === "submitting"}
          className="mt-[22px] h-[54px] w-full rounded-full text-[16px] font-bold text-white disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg,#e6a86a,#e08a5a)",
            boxShadow: "0 6px 16px rgba(230,168,106,.35)",
          }}
        >
          🌱 收下今天
        </button>
        <div className="mb-[24px] mt-[12px] text-center text-[13px] text-ink-faint">
          留给未来的自己 · 今天就到这里
        </div>
      </div>
      <div className="h-[170px] flex-none" />
    </div>
  );
}
