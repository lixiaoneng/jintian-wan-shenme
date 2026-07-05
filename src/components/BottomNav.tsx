"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "今天", icon: "today" },
  { href: "/ideas", label: "种草", icon: "leaf" },
  { href: "/notes", label: "随手记", icon: "note" },
  { href: "/forest", label: "博物馆", icon: "museum" },
] as const;

function TabIcon({
  icon,
  active,
}: {
  icon: (typeof TABS)[number]["icon"];
  active: boolean;
}) {
  const activeColor = "#8a9a6d";
  const inactiveColor = "rgba(58,54,45,.4)";

  if (icon === "today") {
    return (
      <div
        className="h-[9px] w-[9px] rounded-full"
        style={
          active
            ? { background: activeColor }
            : { border: `1.6px solid ${inactiveColor}` }
        }
      />
    );
  }
  if (icon === "leaf") {
    return (
      <div
        className="h-[9px] w-[14px]"
        style={{
          borderRadius: "0 100% 0 100%",
          ...(active
            ? { background: activeColor }
            : { border: `1.6px solid ${inactiveColor}` }),
        }}
      />
    );
  }
  if (icon === "note") {
    // 一张小卡片 + 两条横线，代表「随手记」
    const c = active ? activeColor : inactiveColor;
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: 13,
          height: 11,
          borderRadius: 3,
          border: `1.6px solid ${c}`,
          gap: 2,
        }}
      >
        <span style={{ width: 6, height: 1.4, background: c }} />
        <span style={{ width: 6, height: 1.4, background: c }} />
      </div>
    );
  }
  // museum：小小的博物馆立面（三角门楣 + 立柱）
  const color = active ? activeColor : inactiveColor;
  return (
    <div className="flex flex-col items-center" style={{ gap: 1.5 }}>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderBottom: `6px solid ${color}`,
        }}
      />
      <div className="flex" style={{ gap: 2 }}>
        <span style={{ width: 2, height: 6, background: color }} />
        <span style={{ width: 2, height: 6, background: color }} />
        <span style={{ width: 2, height: 6, background: color }} />
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-[78px] flex-none items-start justify-around border-t border-hairline bg-card pt-[13px]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-[5px] px-2"
            style={{ color: active ? "#8a9a6d" : "rgba(58,54,45,.4)" }}
          >
            <TabIcon icon={tab.icon} active={active} />
            <span
              className="text-[10.5px]"
              style={{ fontWeight: active ? 700 : 500 }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
