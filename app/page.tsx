"use client";

import { useState } from "react";

const MARQUEE_ITEMS = [
  "勉強しているハムスター",
  "電車を運転している猫",
  "ピアノを弾いているペンギン",
  "コーヒーを淹れているクマ",
  "本を読んでいるうさぎ",
  "自転車に乗っているパンダ",
];

const SAMPLE_CHIPS = [
  { action: "勉強している", subject: "ハムスター" },
  { action: "電車を運転している", subject: "猫" },
  { action: "ピアノを弾いている", subject: "ペンギン" },
  { action: "コーヒーを淹れている", subject: "クマ" },
  { action: "本を読んでいる", subject: "うさぎ" },
  { action: "自転車に乗っている", subject: "パンダ" },
];

const NEW_ILLUSTRATIONS = [
  { id: 1, title: "勉強しているハムスター", emoji: "🐹", color: "#FFF3C4" },
  { id: 2, title: "電車を運転している猫", emoji: "🐱", color: "#E8F4FD" },
  { id: 3, title: "ピアノを弾いているペンギン", emoji: "🐧", color: "#EDE7F6" },
  { id: 4, title: "コーヒーを淹れているクマ", emoji: "🐻", color: "#FBE9E7" },
  { id: 5, title: "本を読んでいるうさぎ", emoji: "🐰", color: "#E8F5E9" },
  { id: 6, title: "自転車に乗っているパンダ", emoji: "🐼", color: "#F3E5F5" },
];

const CATEGORIES = [
  { name: "動物", status: "published" as const, count: 128, emoji: "🐾" },
  { name: "食べ物", status: "coming" as const, count: 0, emoji: "🍱" },
  { name: "乗り物", status: "coming" as const, count: 0, emoji: "🚃" },
];

const STEPS = [
  {
    step: "01",
    title: "組み合わせを入力",
    description: "「何をしている？」と「何が？」を入力して、世界にひとつだけの組み合わせを作りましょう。",
  },
  {
    step: "02",
    title: "生成ボタンを押す",
    description: "ボタンを押すだけ。AIがあなただけのイラストを生成します。",
  },
  {
    step: "03",
    title: "イラストが完成",
    description: "生成されたイラストはギャラリーに保存。ダウンロードも自由自在です。",
  },
];

const NAV_LINKS = [
  { label: "ギャラリー", href: "#gallery" },
  { label: "カテゴリ", href: "#categories" },
  { label: "使い方", href: "#how-to" },
];

export default function Home() {
  const [action, setAction] = useState("");
  const [subject, setSubject] = useState("");

  const handleGenerate = () => {
    alert("生成中...");
  };

  const handleChipClick = (chip: (typeof SAMPLE_CHIPS)[number]) => {
    setAction(chip.action);
    setSubject(chip.subject);
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* 1. Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm">
              イ
            </span>
            イラストくん
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-full bg-accent px-4 py-2 text-sm font-bold transition-colors hover:bg-accent-hover sm:hidden"
            onClick={handleGenerate}
          >
            生成する
          </button>
        </div>
      </header>

      {/* 2. Marquee */}
      <div className="overflow-hidden bg-accent py-2.5">
        <div className="marquee-track flex w-max whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} className="mx-6 text-sm font-medium sm:text-base">
              {item}
              <span className="mx-6 opacity-40">·</span>
            </span>
          ))}
        </div>
      </div>

      <main>
        {/* 3 & 4. Hero + Generation Form */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 inline-block rounded-full border border-border bg-white/60 px-4 py-1 text-xs font-medium text-muted">
              AI イラスト生成サービス
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              世界中で1人だけが使うかもしれない
              <span className="mt-1 block text-accent-hover">イラスト集</span>
            </h1>
            <p className="mt-4 text-sm text-muted sm:text-base">
              好きな組み合わせを入力すると、世界に１つだけのイラストが生まれます。作ったイラストは「新着イラスト」で公開され、この世界の誰かが使うかもしれません。
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="action" className="mb-1.5 block text-sm font-medium">
                  何をしている？
                </label>
                <input
                  id="action"
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="例：勉強している、電車を運転している"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
                  何が？
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="例：ハムスター、猫"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold transition-colors hover:bg-accent-hover active:scale-[0.99]"
              >
                イラストを生成する
              </button>
            </div>

            {/* 5. Sample Chips */}
            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 text-xs font-medium text-muted">サンプルを試す</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_CHIPS.map((chip) => (
                  <button
                    key={`${chip.action}-${chip.subject}`}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:border-accent hover:bg-accent/10 sm:text-sm"
                  >
                    {chip.action}
                    {chip.subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. New Illustrations Grid */}
        <section id="gallery" className="border-t border-border bg-white/50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">新着イラスト</h2>
                <p className="mt-1 text-sm text-muted">みんなが作ったイラストをチェック</p>
              </div>
              <a href="#" className="hidden text-sm font-medium text-muted hover:text-foreground sm:block">
                すべて見る →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
              {NEW_ILLUSTRATIONS.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex aspect-square items-center justify-center text-5xl transition-transform group-hover:scale-105 sm:text-6xl"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.emoji}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-xs font-medium leading-snug sm:text-sm">{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Categories */}
        <section id="categories" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">カテゴリ</h2>
            <p className="mt-1 text-sm text-muted">ジャンル別にイラストを探す</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
              {CATEGORIES.map((category) => (
                <div
                  key={category.name}
                  className={`relative overflow-hidden rounded-2xl border p-6 transition-shadow ${
                    category.status === "published"
                      ? "border-border bg-white hover:shadow-md"
                      : "border-dashed border-border bg-background opacity-75"
                  }`}
                >
                  <span className="text-3xl">{category.emoji}</span>
                  <h3 className="mt-3 text-lg font-bold">{category.name}</h3>
                  {category.status === "published" ? (
                    <>
                      <p className="mt-1 text-sm text-muted">{category.count} 枚のイラスト</p>
                      <span className="mt-3 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium">
                        公開中
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-sm text-muted">準備中です</p>
                      <span className="mt-3 inline-block rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted">
                        近日公開
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. How to Use - 3 Steps */}
        <section id="how-to" className="bg-foreground py-16 text-background sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">使い方</h2>
              <p className="mt-2 text-sm text-background/60">3ステップで完成</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((step) => (
                <div key={step.step} className="relative rounded-2xl border border-background/10 p-6">
                  <span className="text-4xl font-bold text-accent">{step.step}</span>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-background/70">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs">
                イ
              </span>
              イラストくん
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </a>
              ))}
              <a href="#" className="hover:text-foreground">
                利用規約
              </a>
              <a href="#" className="hover:text-foreground">
                プライバシーポリシー
              </a>
            </nav>
          </div>
          <p className="mt-8 text-center text-xs text-muted">
            © {new Date().getFullYear()} イラストくん. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
