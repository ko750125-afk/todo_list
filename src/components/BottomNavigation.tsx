"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, CalendarClock } from "lucide-react";

const tabs = [
  { href: "/", label: "할일 목록", icon: CheckSquare },
  { href: "/recurring", label: "정기입금", icon: CalendarClock },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border/70 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2">
      <div className="mx-auto flex max-w-lg px-4 gap-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                active
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
              }`}
            >
              <Icon className={`size-5 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

