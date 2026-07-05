"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/session-provider";
import {
  bumpIdeaAfterPlay,
  completeActivity,
  createActivity,
  createReflection,
} from "@/lib/storage";
import { useAppState } from "@/lib/app-state";
import type { Idea } from "@/lib/types";

const MOODS = ["超喜欢", "还不错", "一般般", "下次还想"];

export function ExperienceOverlay({
  idea,
  actionText,
  onClose,
}: {
  idea: Idea;
  actionText: string;
  onClose: () => void;
}) {
  const { userId } = useSession();
  const { bumpRefresh } = useAppState();
  const [step, setStep] = useState<"doing" | "reflect" | "grown">("doing");
  const [activityId, setActivityId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!userId || startedRef.current) return;
    startedRef.current = true;
    createActivity(userId, idea.id, actionText)
      .then((activity) => setActivityId(activity.id))
      .catch((e) => console.error(e));
  }, [userId, idea.id, actionText]);

  async function handleFinishDoing() {
    if (!activityId || busy) return;
    setBusy(true);
    try {
      await completeActivity(activityId);
      await bumpIdeaAfterPlay(idea);
      setStep("reflect");
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitReflection(skip: boolean) {
    if (busy) return;
    setBusy(true);
    try {
      if (!skip && userId && (text.trim() || mood)) {
        await createReflection({
          userId,
          activityId,
          ideaId: idea.id,
          text: text.trim() || null,
          mood,
        });
      }
      bumpRefresh();
      setStep("grown");
      setTimeout(onClose, 1100);
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  if (step === "doing") {
    return (
      <div className="absolute inset-0 z-30 flex flex-col bg-page">
        <div className="h-[54px] flex-none" />
        <div className="flex flex-1 flex-col px-[26px]">
          <div
            className="mt-[16px] rounded-[26px] p-[24px]"
            style={{
              background: "linear-gradient(135deg,#8a9a6d,#7d9068)",
              boxShadow: "var(--shadow-hero)",
            }}
          >
            <div
              className="text-[12px] font-semibold tracking-[.04em] text-white"
              style={{ color: "rgba(255,255,255,.8)" }}
            >
              正在试试看
            </div>
            <div className="mt-[12px] text-[21px] font-bold leading-[1.4] text-white">
              {actionText}
            </div>
            <div
              className="mt-[8px] text-[13.5px] leading-[1.5]"
              style={{ color: "rgba(255,255,255,.82)" }}
            >
              来自「{idea.text}」。不用做到完美，碰一下就好。
            </div>
          </div>

          <div className="mt-[26px] text-center text-[14.5px] leading-[1.7] text-ink-secondary">
            给自己 10-15 分钟。
            <br />
            做完了，回来留一句就好。
          </div>

          <div className="flex-1" />

          <button
            onClick={handleFinishDoing}
            disabled={busy}
            className="h-[54px] w-full rounded-full text-[16px] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--color-sage)", boxShadow: "var(--shadow-btn)" }}
          >
            我做完啦，留一句
          </button>
          <button
            onClick={onClose}
            className="mb-[8px] mt-[14px] text-center text-[14px] font-semibold text-ink-faint"
          >
            还没准备好，先返回
          </button>
        </div>
      </div>
    );
  }

  if (step === "reflect") {
    return (
      <div
        className="absolute inset-0 z-30 flex flex-col items-center overflow-y-auto px-[30px] text-center"
        style={{ background: "linear-gradient(180deg,#eef0e4 0%,#f5f1e8 60%)" }}
      >
        <div className="h-[54px] flex-none" />
        {/* 一件待入馆的展品：小画框 */}
        <div
          className="mt-[24px] flex h-[84px] w-[84px] items-center justify-center rounded-[18px] text-[34px]"
          style={{
            background: "#fff",
            border: "3px solid #e3d9c2",
            boxShadow: "0 6px 18px rgba(90,84,64,.1)",
          }}
        >
          🖼️
        </div>
        <div className="mt-[16px] text-[24px] font-bold text-ink">刚刚怎么样？</div>
        <div className="mt-[8px] text-[14.5px] leading-[1.6] text-ink-secondary">
          你刚试了「{idea.text}」
          <br />
          不想写也没关系，写一句给以后的自己。
        </div>
        <div
          className="mt-[24px] w-full rounded-[22px] bg-white p-[18px] text-left"
          style={{ minHeight: 80, boxShadow: "0 6px 20px rgba(90,84,64,.08)" }}
        >
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="留一句…比想象中好玩"
            rows={2}
            className="w-full resize-none bg-transparent text-[16px] leading-[1.5] text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <div className="mt-[16px] flex flex-wrap justify-center gap-[9px]">
          {MOODS.map((m) => {
            const active = mood === m;
            return (
              <button
                key={m}
                onClick={() => setMood(active ? null : m)}
                className="rounded-full px-[16px] py-[8px] text-[13.5px] font-semibold"
                style={
                  active
                    ? { background: "var(--color-sage)", color: "#fff" }
                    : {
                        background: "#fff",
                        color: "rgba(58,54,45,.55)",
                        border: "1px solid rgba(0,0,0,.05)",
                      }
                }
              >
                {m}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleSubmitReflection(false)}
          disabled={busy}
          className="mt-[26px] h-[54px] w-full flex-none rounded-full text-[16px] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--color-sage)", boxShadow: "var(--shadow-btn)" }}
        >
          收进博物馆 🏛️
        </button>
        <button
          onClick={() => handleSubmitReflection(true)}
          disabled={busy}
          className="mb-[24px] mt-[14px] text-[14px] font-semibold text-ink-faint"
        >
          先不写
        </button>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-[30px] text-center"
      style={{ background: "linear-gradient(180deg,#eef0e4 0%,#f5f1e8 60%)" }}
    >
      <div className="animate-grow-in text-[40px]">🏛️</div>
      <div className="mt-[18px] text-[19px] font-bold text-ink">
        这件小事已经入馆啦
      </div>
      <div className="mt-[8px] text-[14px] text-ink-secondary">
        成为你博物馆里的新藏品
      </div>
    </div>
  );
}
