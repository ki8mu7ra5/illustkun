"use client";

import { useEffect, useState } from "react";

type GenerateLoadingScreenProps = {
  title: string;
  active: boolean;
};

const COUNTDOWN_START = 40;

export function GenerateLoadingScreen({
  title,
  active,
}: GenerateLoadingScreenProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  useEffect(() => {
    if (!active) {
      setCountdown(COUNTDOWN_START);
      return;
    }

    setCountdown(COUNTDOWN_START);
    const interval = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [active]);

  const progress = ((COUNTDOWN_START - countdown) / COUNTDOWN_START) * 100;
  const timeLabel = countdown > 0 ? `あと${countdown}秒` : "もうすぐ完成...";

  return (
    <div className="max-w-[600px] rounded-xl border border-border bg-card p-8 text-center">
      <div className="relative mx-auto mb-6 flex h-44 w-44 items-center justify-center">
        <div className="generate-pulse-ring absolute inset-0 rounded-full border-2 border-accent/30" />
        <div className="generate-pulse-ring-delay absolute inset-3 rounded-full border-2 border-accent/20" />

        <span className="generate-sparkle absolute left-2 top-4 text-lg">✦</span>
        <span className="generate-sparkle-delay absolute right-3 top-6 text-sm">✧</span>
        <span className="generate-sparkle absolute bottom-5 left-6 text-base">★</span>
        <span className="generate-sparkle-delay absolute bottom-8 right-5 text-xs">✦</span>

        <div className="generate-float relative flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-background-secondary shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <span className="text-5xl">🎨</span>
        </div>
      </div>

      <p className="mb-1 text-base font-bold">イラストを生成中...</p>
      <p className="mb-6 text-sm text-muted">{title}</p>

      <div className="mx-auto mb-4 h-2 max-w-[240px] overflow-hidden rounded-full bg-background-secondary">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <p
        className={`text-lg font-bold tracking-wide ${
          countdown > 0 ? "text-foreground" : "generate-text-pulse text-accent-dark"
        }`}
      >
        {timeLabel}
      </p>

      <div className="mt-5 flex items-center justify-center gap-2">
        <span className="generate-dot h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="generate-dot-delay h-2.5 w-2.5 rounded-full bg-accent/70" />
        <span className="generate-dot-delay-2 h-2.5 w-2.5 rounded-full bg-accent/50" />
      </div>

      <p className="mt-5 text-[11px] text-muted-light">
        AIが約30〜40秒でイラストを描いています
      </p>
    </div>
  );
}
