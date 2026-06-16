"use client";

import { useEffect, useState } from "react";

type GenerationStats = {
  total: number;
  today: number;
};

type GenerationCounterProps = {
  refreshKey?: string | number | null;
};

function useCountUp(target: number, duration = 1400): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame = 0;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    setValue(0);
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return value;
}

export function GenerationCounter({ refreshKey }: GenerationCounterProps) {
  const [stats, setStats] = useState<GenerationStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const response = await fetch("/api/generation-stats", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as GenerationStats;
        if (!cancelled) setStats(data);
      } catch (error) {
        console.error("Failed to fetch generation stats:", error);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const totalCount = useCountUp(stats?.total ?? 0);
  const todayCount = useCountUp(stats?.today ?? 0);

  if (!stats) return null;

  return (
    <div className="mt-5 space-y-1 text-sm leading-relaxed text-muted">
      <p>
        これまでに
        <span className="mx-1.5 text-lg font-extrabold tabular-nums text-accent-dark">
          {totalCount.toLocaleString()}
        </span>
        枚のイラストが生成されました！
      </p>
      <p className="text-xs text-muted-light">
        今日だけで
        <span className="mx-1 font-bold tabular-nums text-foreground">
          {todayCount.toLocaleString()}
        </span>
        枚！
      </p>
    </div>
  );
}
