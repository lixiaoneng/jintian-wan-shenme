"use client";

import { usePathname } from "next/navigation";
import { useAppState } from "@/lib/app-state";

export function Fab() {
  const { openSpark, openNoteComposer } = useAppState();
  const pathname = usePathname();

  // 在随手记页，+ 记一条普通记录；其它页 + 是灵光一闪（记想试的事）
  const onNotes = pathname === "/notes";
  const handleClick = onNotes ? openNoteComposer : openSpark;
  const label = onNotes ? "随手记一条" : "灵光一闪，记下一个念头";

  return (
    <button
      onClick={handleClick}
      aria-label={label}
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
