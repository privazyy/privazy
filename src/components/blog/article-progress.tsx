"use client";

import { useEffect, useState } from "react";

import type { BlogTocItem } from "@/lib/blog";
import { cn } from "@/lib/utils";

export function ArticleProgress({ toc }: { toc: BlogTocItem[] }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");

  useEffect(() => {
    const update = () => {
      const element = document.scrollingElement ?? document.documentElement;
      const max = element.scrollHeight - element.clientHeight;
      const nextProgress = max > 0 ? Math.min(1, Math.max(0, element.scrollTop / max)) : 0;
      const probe = element.scrollTop + 140;
      let nextActive = toc[0]?.id ?? "";

      toc.forEach((item) => {
        const node = document.getElementById(item.id);
        if (node && node.offsetTop <= probe) nextActive = item.id;
      });

      if (max > 0 && element.scrollTop >= max - 4) {
        nextActive = toc[toc.length - 1]?.id ?? nextActive;
      }

      setProgress(nextProgress);
      setActiveId(nextActive);
    };

    const timer = window.setTimeout(update, 0);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [toc]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-blue-50">
        <div
          className="h-full transition-[width] duration-100"
          style={{
            background: "linear-gradient(90deg, var(--blue-600), var(--blue-400))",
            width: `${progress * 100}%`,
          }}
        />
      </div>
      <nav
        aria-label="Spis treści"
        className="fixed top-1/2 z-40 hidden w-56 -translate-y-1/2 xl:block"
        style={{ left: "max(20px, calc((100vw - 760px) / 2 - 240px))" }}
      >
        <div className="mb-3 pl-4 text-xs font-bold uppercase tracking-normal text-slate-500">
          Spis treści
        </div>
        <ul className="flex flex-col border-l border-slate-200">
          {toc.map((item, index) => {
            const active = item.id === activeId;

            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "-ml-px flex gap-2.5 border-l-2 px-3.5 py-2 text-sm leading-snug transition",
                    active
                      ? "border-blue-500 font-semibold text-blue-700"
                      : "border-transparent font-medium text-slate-500 hover:text-blue-500",
                  )}
                >
                  <span className={cn("font-mono text-xs", active ? "text-blue-500" : "text-slate-400")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
