"use client";

import { clearAllData, resetDemoData } from "@/lib/storage";

// 数据入口：刻意做得很低调，放在博物馆页最底部。
// 「清空本地数据」只在开发环境出现；生产环境只保留「重置 demo 数据」，且都需二次确认。
const isDev = process.env.NODE_ENV === "development";

export function DevDataControls() {
  function reset() {
    if (confirm("要把博物馆恢复成初始的示例内容吗？你现在记下的念头和藏品会被替换。")) {
      resetDemoData();
      window.location.reload();
    }
  }
  function clear() {
    if (confirm("确定清空所有本地数据吗？这会删掉你记下的所有念头和藏品。")) {
      clearAllData();
      window.location.reload();
    }
  }

  return (
    <div className="mt-[10px] flex items-center justify-center gap-[18px] text-[11.5px] text-ink-faint">
      <button onClick={reset} className="underline underline-offset-2">
        重置 demo 数据
      </button>
      {isDev && (
        <>
          <span style={{ opacity: 0.4 }}>·</span>
          <button onClick={clear} className="underline underline-offset-2">
            清空本地数据
          </button>
        </>
      )}
    </div>
  );
}
