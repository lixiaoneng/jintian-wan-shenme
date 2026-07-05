"use client";

import { clearAllData, resetDemoData } from "@/lib/storage";

// 开发/验证入口：重置或清空本地数据。刻意做得很低调，放在页面最底部。
export function DevDataControls() {
  function reset() {
    resetDemoData();
    window.location.reload();
  }
  function clear() {
    if (confirm("确定清空所有本地数据吗？这会删掉你记下的所有念头和藏品。")) {
      clearAllData();
      window.location.reload();
    }
  }

  return (
    <div className="mt-[8px] flex items-center justify-center gap-[18px] text-[11.5px] text-ink-faint">
      <button onClick={reset} className="underline underline-offset-2">
        重置 demo 数据
      </button>
      <span style={{ opacity: 0.4 }}>·</span>
      <button onClick={clear} className="underline underline-offset-2">
        清空本地数据
      </button>
    </div>
  );
}
