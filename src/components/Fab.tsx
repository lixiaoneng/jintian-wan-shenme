"use client";

import { useAppState } from "@/lib/app-state";

export function Fab() {
  const { openSpark } = useAppState();

  return (
    <button
      onClick={openSpark}
      aria-label="灵光一闪，记下一个念头"
      className="absolute right-[22px] bottom-[96px] flex h-[60px] w-[60px] items-center justify-center rounded-full text-white active:scale-95 transition-transform"
      style={{
        background: "#c9a86a",
        boxShadow: "var(--shadow-fab)",
      }}
    >
      <span className="text-[30px] leading-none font-normal -mt-1">+</span>
    </button>
  );
}
