"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ACTION_FILTER_TAGS, type ActionTagCategory } from "./lib/classify";
import { highlightText } from "./lib/highlight";
import { normalize } from "./lib/normalize";

type Illustration = {
  id: number;
  title: string;
  action: string;
  subject: string;
  actionTag: Exclude<ActionTagCategory, "すべて">;
  emoji: string;
  meta: string;
};

const SAMPLE_CHIPS = [
  { action: "電車を運転している", subject: "猫", label: "電車を運転している猫" },
  { action: "勉強している", subject: "ハムスター", label: "勉強しているハムスター" },
  { action: "サッカーをしている", subject: "ワニ", label: "サッカーをしているワニ" },
  { action: "将棋を指している", subject: "ゴリラ", label: "将棋を指しているゴリラ" },
  { action: "スキーをしている", subject: "ペンギン", label: "スキーをしているペンギン" },
];

const NEW_ILLUSTRATIONS: Illustration[] = [
  {
    id: 1,
    title: "勉強しているハムスター",
    action: "勉強している",
    subject: "ハムスター",
    actionTag: "勉強仕事",
    emoji: "🐹",
    meta: "3分前",
  },
  {
    id: 2,
    title: "サッカーをするワニ",
    action: "サッカーをする",
    subject: "鰐",
    actionTag: "スポーツ系",
    emoji: "🐊",
    meta: "12分前",
  },
  {
    id: 3,
    title: "電車を運転している猫",
    action: "電車を運転している",
    subject: "猫",
    actionTag: "乗り物系",
    emoji: "🐈",
    meta: "28分前",
  },
  {
    id: 4,
    title: "将棋を指しているゴリラ",
    action: "将棋を指している",
    subject: "ゴリラ",
    actionTag: "音楽趣味",
    emoji: "🦍",
    meta: "1時間前",
  },
  {
    id: 5,
    title: "スキーをするペンギン",
    action: "スキーをする",
    subject: "ペンギン",
    actionTag: "スポーツ系",
    emoji: "🐧",
    meta: "2時間前",
  },
];

const CATEGORIES = [
  { name: "動物", emoji: "🐾", status: "active" as const },
  { name: "食べ物", emoji: "🍜", status: "soon" as const },
  { name: "乗り物", emoji: "🚃", status: "soon" as const },
  { name: "植物", emoji: "🌿", status: "soon" as const },
  { name: "人物", emoji: "👤", status: "soon" as const },
  { name: "建物", emoji: "🏠", status: "soon" as const },
  { name: "スポーツ", emoji: "⚽", status: "soon" as const },
  { name: "音楽", emoji: "🎵", status: "soon" as const },
];

const STEPS = [
  {
    step: "STEP 01",
    title: "行動と対象を入力",
    description:
      "「何をしている？」「何が？」の2項目だけ。プロンプトの知識は一切不要です。",
  },
  {
    step: "STEP 02",
    title: "AIがその場で生成",
    description:
      "gpt-image-1が約30秒でイラストを生成。背景透過のPNGで出力されます。",
  },
  {
    step: "STEP 03",
    title: "無料でダウンロード",
    description:
      "生成したイラストはすぐDL可能。承認後にサイトに追加され、みんなが使えるようになります。",
  },
];

const NAV_LINKS = [
  { label: "ギャラリー", href: "#gallery" },
  { label: "カテゴリ", href: "#categories" },
  { label: "使い方", href: "#how-to" },
];

function scrollToGenerate() {
  document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });
}

function matchesSearch(
  item: Illustration,
  searchAction: string,
  searchSubject: string,
): boolean {
  const normActionQuery = normalize(searchAction.trim());
  const normSubjectQuery = normalize(searchSubject.trim());

  if (!normActionQuery && !normSubjectQuery) return true;

  const normTitle = normalize(item.title);
  const normAction = normalize(item.action);
  const normSubject = normalize(item.subject);

  const actionMatch =
    !normActionQuery ||
    normAction.includes(normActionQuery) ||
    normTitle.includes(normActionQuery);

  const subjectMatch =
    !normSubjectQuery ||
    normSubject.includes(normSubjectQuery) ||
    normTitle.includes(normSubjectQuery);

  return actionMatch && subjectMatch;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function Home() {
  const [action, setAction] = useState("");
  const [subject, setSubject] = useState("");
  const [generating, setGenerating] = useState(false);
  const [searchAction, setSearchAction] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [activeFilterTag, setActiveFilterTag] = useState<ActionTagCategory>("すべて");
  const [shuffledIds, setShuffledIds] = useState<number[] | null>(null);

  const actionTrimmed = action.trim();
  const subjectTrimmed = subject.trim();
  const searchActionTrimmed = searchAction.trim();
  const searchSubjectTrimmed = searchSubject.trim();

  const filteredIllustrations = useMemo(() => {
    return NEW_ILLUSTRATIONS.filter((item) => {
      if (activeFilterTag !== "すべて" && item.actionTag !== activeFilterTag) {
        return false;
      }
      return matchesSearch(item, searchAction, searchSubject);
    });
  }, [searchAction, searchSubject, activeFilterTag]);

  const displayedIllustrations = useMemo(() => {
    if (!shuffledIds) return filteredIllustrations;
    const byId = new Map(filteredIllustrations.map((item) => [item.id, item]));
    return shuffledIds
      .map((id) => byId.get(id))
      .filter((item): item is Illustration => item !== undefined);
  }, [filteredIllustrations, shuffledIds]);

  useEffect(() => {
    setShuffledIds(null);
  }, [searchAction, searchSubject, activeFilterTag]);

  const highlightKeywords = [searchActionTrimmed, searchSubjectTrimmed].filter(Boolean);

  const handleRandom = () => {
    setShuffledIds(shuffleArray(filteredIllustrations.map((item) => item.id)));
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    document.getElementById("gallery-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  const previewText =
    !actionTrimmed && !subjectTrimmed ? (
      "動物と行動を入力してください"
    ) : (
      <>
        <strong className="text-foreground">
          {actionTrimmed || "___"} {subjectTrimmed || "___"}
        </strong>
        {" のイラストを生成します"}
      </>
    );

  const handleGenerate = () => {
    if (!actionTrimmed || !subjectTrimmed) {
      alert("行動と対象を両方入力してください");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`「${actionTrimmed} ${subjectTrimmed}」を生成しました！`);
    }, 2000);
  };

  const handleChipClick = (chip: (typeof SAMPLE_CHIPS)[number]) => {
    setAction(chip.action);
    setSubject(chip.subject);
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3 sm:px-7">
          <a href="#" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
            イラストくん
          </a>
          <nav className="flex items-center gap-3 sm:gap-5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hidden text-[13px] text-muted no-underline sm:inline"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={scrollToGenerate}
              className="rounded-full bg-foreground px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
            >
              イラストを作る
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[700px] px-6 py-14 text-center sm:px-6 sm:py-16">
          <h1 className="mb-4 text-[clamp(28px,5vw,48px)] font-extrabold leading-tight tracking-tight">
            世界の誰か1人にだけ
            <br />
            刺さるイラスト集
          </h1>
          <p className="mb-7 text-sm leading-relaxed text-muted">
            あなたのイラストが世界の誰かの心に刺さりますように。
            <br />
            世界のどこかに掲載されますように。
          </p>
          <button
            type="button"
            onClick={scrollToGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
          >
            ✦ イラストを作る（無料）
          </button>
          <span className="mt-2.5 block text-xs text-muted-light">
            または下のギャラリーから探す
          </span>
          <span className="mt-2 inline-block rounded-full border border-border px-3.5 py-1 text-xs text-muted-light">
            画像の生成・使用はすべて無料　商用利用OK
          </span>
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="gallery" className="mx-auto max-w-[1100px] px-6 py-10">
          <form
            onSubmit={handleSearchSubmit}
            className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
              <div>
                <label
                  htmlFor="search-action"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-light"
                >
                  何をしている？
                </label>
                <input
                  id="search-action"
                  type="text"
                  value={searchAction}
                  onChange={(e) => setSearchAction(e.target.value)}
                  placeholder="例：サッカー、勉強、料理"
                  className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                />
              </div>
              <div>
                <label
                  htmlFor="search-subject"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-light"
                >
                  何が？
                </label>
                <input
                  id="search-subject"
                  type="text"
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  placeholder="例：ネコ、ワニ、ハムスター"
                  className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                />
              </div>
              <button
                type="submit"
                className="rounded-[var(--radius-sm)] bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-87"
              >
                検索
              </button>
              <button
                type="button"
                onClick={handleRandom}
                className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border-[1.5px] border-foreground bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-white"
              >
                <span aria-hidden>🎲</span>
                ランダムで見る
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ACTION_FILTER_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveFilterTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    activeFilterTag === tag
                      ? "border-foreground bg-foreground text-white"
                      : "border-border bg-background-secondary text-muted hover:border-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>

          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">新着イラスト</h2>
              <p className="mt-1 text-xs text-muted-light">
                {displayedIllustrations.length}件表示中
              </p>
            </div>
            <a href="#" className="text-xs text-muted no-underline">
              すべて見る →
            </a>
          </div>
          <div id="gallery-grid" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {displayedIllustrations.map((item) => (
              <article
                key={item.id}
                className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
              >
                <div className="flex aspect-square items-center justify-center border-b border-border bg-background-secondary text-4xl">
                  {item.emoji}
                </div>
                <div className="px-2.5 py-2">
                  <h3 className="mb-0.5 text-[11px] font-semibold leading-snug">
                    {highlightText(item.title, highlightKeywords)}
                  </h3>
                  <p className="text-[10px] text-muted-light">{item.meta}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-light">
            管理人の承認後、新着イラストに掲載されます。毎日23時頃に更新しています。
          </p>
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="categories" className="mx-auto max-w-[1100px] px-6 pb-10 pt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold tracking-tight">カテゴリから探す</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <div
                key={category.name}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] ${
                  category.status === "active"
                    ? "cursor-pointer border-foreground bg-foreground text-white"
                    : "cursor-default border-border bg-card opacity-50"
                }`}
              >
                <span className="text-base">{category.emoji}</span>
                {category.name}
                {category.status === "soon" && (
                  <span className="ml-0.5 rounded-full bg-background-secondary px-1.5 py-px text-[10px] text-muted-light">
                    近日
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="generate" className="mx-auto max-w-[1100px] px-6 pb-10 pt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold tracking-tight">イラストを作る</h2>
          </div>
          <div className="max-w-[600px] rounded-xl border border-border bg-card p-7">
            <div className="mb-1.5 text-base font-bold">欲しいイラストを入力してください</div>
            <p className="mb-5 text-[13px] text-muted">
              「何をしている？」＋「何が？」の2項目だけ。プロンプトの知識は不要です。
            </p>
            <div className="mb-3.5 grid grid-cols-1 items-center gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
              <div>
                <label
                  htmlFor="action"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-light"
                >
                  何をしている？
                </label>
                <input
                  id="action"
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="電車を運転している"
                  className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                />
                <span className="mt-1 block text-[11px] text-muted-light">
                  例：サッカーをしている　本を読んでいる
                </span>
              </div>
              <div className="hidden text-center text-xl font-light text-muted-light sm:block">
                ×
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-light"
                >
                  何が？
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="ネコ"
                  className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                />
                <span className="mt-1 block text-[11px] text-muted-light">
                  例：ハムスター　ゴリラ　ワニ
                </span>
              </div>
            </div>
            <div className="mb-3.5 min-h-6 text-center text-[13px] text-muted">
              {previewText}
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full rounded-[var(--radius-sm)] bg-foreground py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-87 disabled:opacity-60"
            >
              {generating
                ? "⏳ 生成中..."
                : "✦ このイラストをAIで生成する（無料）"}
            </button>
            <p className="mt-2.5 text-center text-[11px] text-muted-light">
              生成したイラストは承認後にサイトに追加され、みんなが使えるようになります
            </p>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {SAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="cursor-pointer rounded-full border border-border bg-background-secondary px-3 py-1.5 text-xs text-muted transition-all hover:border-foreground hover:bg-foreground hover:text-white"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="how-to" className="bg-foreground px-6 py-12">
          <div className="mx-auto max-w-[900px]">
            <h2 className="mb-1.5 text-[22px] font-extrabold tracking-tight text-white">
              どうやって使うの？
            </h2>
            <p className="mb-8 text-[13px] text-white/40">
              3ステップで欲しいイラストがすぐ手に入ります
            </p>
            <div className="grid gap-5 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.step}>
                  <div className="mb-2 text-[11px] font-bold tracking-widest text-accent">
                    {step.step}
                  </div>
                  <h3 className="mb-1.5 text-[15px] font-bold text-white">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-white/50">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-border px-6 py-6 sm:flex-row sm:px-7">
        <div className="text-[15px] font-bold">イラストくん</div>
        <nav className="flex gap-4">
          <a href="#" className="text-xs text-muted-light no-underline">
            利用規約
          </a>
          <a href="#" className="text-xs text-muted-light no-underline">
            プライバシーポリシー
          </a>
          <a href="#" className="text-xs text-muted-light no-underline">
            お問い合わせ
          </a>
        </nav>
        <div className="text-xs text-muted-light">
          © {new Date().getFullYear()} イラストくん
        </div>
      </footer>
    </div>
  );
}
