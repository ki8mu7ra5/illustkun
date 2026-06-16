"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GenerateLoadingScreen } from "./components/generate-loading-screen";
import { GenerateResultScreen } from "./components/generate-result-screen";
import { GenerationCounter } from "./components/generation-counter";
import { RankingList } from "./components/ranking-list";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { buildCategoryHref } from "./lib/filter-illustrations";
import {
  CATEGORY_GENRE_VALUES,
  formatRelativeTime,
  type IllustrationRecord,
  type RankingIllustration,
} from "./lib/illustration-db";
import {
  TAG_FILTERS,
  TOP_CATEGORY_CHIPS,
  type CategoryKey,
  type IllustrationTag,
} from "./lib/illustrations";
import { supabase } from "./lib/supabase";

const ILLUSTRATION_LIST_SELECT =
  "id, title, image_url, genre, sub_genre, subject, created_at";

const STEPS = [
  {
    step: "Step 01",
    title: "行動と対象を入力",
    description:
      "「何をしている？」「何が？」の2項目だけ。プロンプトの知識は一切不要です。",
  },
  {
    step: "Step 02",
    title: "AIがその場で生成",
    description:
      "gpt-image-1が約30秒でイラストを生成。背景透過のPNGで出力されます。",
  },
  {
    step: "Step 03",
    title: "無料でダウンロード",
    description:
      "生成したイラストはすぐDL可能。承認後にサイトに追加され、みんなが使えるようになります。",
  },
];

function scrollToGenerate() {
  document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });
}

type GeneratedResult = {
  title: string;
  image_url: string;
};

function NewDbIllustrationGrid({
  items,
  emptyMessage = "公開中のイラストはまだありません",
}: {
  items: IllustrationRecord[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-[13px] text-muted-light">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {items.map((item) => (
        <NewDbIllustrationCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function DbIllustrationSection({
  items,
  loading,
  emptyMessage,
}: {
  items: IllustrationRecord[];
  loading: boolean;
  emptyMessage?: string;
}) {
  if (loading) return <NewIllustrationSkeletonGrid />;
  return <NewDbIllustrationGrid items={items} emptyMessage={emptyMessage} />;
}

function NewIllustrationSkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="aspect-square animate-pulse bg-background-secondary" />
          <div className="space-y-2 p-2.5">
            <div className="h-3 animate-pulse rounded bg-background-secondary" />
            <div className="h-2 w-2/3 animate-pulse rounded bg-background-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NewDbIllustrationCard({ item }: { item: IllustrationRecord }) {
  return (
    <Link
      href={`/illustration/${item.id}`}
      className="block text-inherit no-underline"
    >
      <article className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
        <div className="aspect-square border-b border-border bg-background-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="px-2.5 py-2">
          <h3 className="mb-0.5 text-[11px] font-semibold leading-snug">{item.title}</h3>
          <p className="text-[10px] text-muted-light">
            {item.subject || item.sub_genre || item.genre}・{formatRelativeTime(item.created_at)}
          </p>
        </div>
      </article>
    </Link>
  );
}

function MiniRankingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[88px] animate-pulse rounded-2xl border border-border bg-card sm:h-[96px]"
        />
      ))}
    </div>
  );
}

function SectionLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border px-3.5 py-1 text-[13px] text-muted no-underline transition-colors hover:border-foreground hover:bg-foreground hover:text-white"
    >
      もっと見る
    </Link>
  );
}

export default function Home() {
  const [action, setAction] = useState("");
  const [subject, setSubject] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [searchAction, setSearchAction] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [currentCat, setCurrentCat] = useState<CategoryKey>("animal");
  const [currentTag, setCurrentTag] = useState<IllustrationTag>("スポーツ");
  const [newDbItems, setNewDbItems] = useState<IllustrationRecord[]>([]);
  const [newDbLoading, setNewDbLoading] = useState(true);
  const [categoryItems, setCategoryItems] = useState<IllustrationRecord[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [tagItems, setTagItems] = useState<IllustrationRecord[]>([]);
  const [tagLoading, setTagLoading] = useState(true);
  const [keywordItems, setKeywordItems] = useState<IllustrationRecord[]>([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [miniRanking, setMiniRanking] = useState<RankingIllustration[]>([]);
  const [miniRankingLoading, setMiniRankingLoading] = useState(true);

  const actionTrimmed = action.trim();
  const subjectTrimmed = subject.trim();
  const searchActionTrimmed = searchAction.trim();
  const searchSubjectTrimmed = searchSubject.trim();
  const hasKeywordQuery = Boolean(searchActionTrimmed || searchSubjectTrimmed);

  useEffect(() => {
    async function fetchNewIllustrations() {
      setNewDbLoading(true);
      const { data, error } = await supabase
        .from("illustrations")
        .select(ILLUSTRATION_LIST_SELECT)
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setNewDbItems(data as IllustrationRecord[]);
      }
      setNewDbLoading(false);
    }

    fetchNewIllustrations();
  }, [generatedResult]);

  useEffect(() => {
    async function fetchMiniRanking() {
      setMiniRankingLoading(true);
      const response = await fetch("/api/ranking?limit=3");
      if (response.ok) {
        const data = (await response.json()) as RankingIllustration[];
        setMiniRanking(data);
      } else {
        setMiniRanking([]);
      }
      setMiniRankingLoading(false);
    }

    fetchMiniRanking();
  }, [generatedResult]);

  useEffect(() => {
    async function fetchCategoryIllustrations() {
      setCategoryLoading(true);
      const genres = CATEGORY_GENRE_VALUES[currentCat] ?? [currentCat];
      const { data, error } = await supabase
        .from("illustrations")
        .select(ILLUSTRATION_LIST_SELECT)
        .eq("approved", true)
        .in("genre", genres)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setCategoryItems(data as IllustrationRecord[]);
      } else {
        setCategoryItems([]);
      }
      setCategoryLoading(false);
    }

    fetchCategoryIllustrations();
  }, [currentCat, generatedResult]);

  useEffect(() => {
    async function fetchTagIllustrations() {
      setTagLoading(true);
      const { data, error } = await supabase
        .from("illustrations")
        .select(ILLUSTRATION_LIST_SELECT)
        .eq("approved", true)
        .contains("tags", [currentTag])
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setTagItems(data as IllustrationRecord[]);
      } else {
        setTagItems([]);
      }
      setTagLoading(false);
    }

    fetchTagIllustrations();
  }, [currentTag, generatedResult]);

  useEffect(() => {
    if (!hasKeywordQuery) {
      setKeywordItems([]);
      setKeywordLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setKeywordLoading(true);

      let query = supabase
        .from("illustrations")
        .select(ILLUSTRATION_LIST_SELECT)
        .eq("approved", true);

      if (searchActionTrimmed) {
        query = query.or(
          `title.ilike.%${searchActionTrimmed}%,action.ilike.%${searchActionTrimmed}%`,
        );
      }

      if (searchSubjectTrimmed) {
        query = query.or(
          `title.ilike.%${searchSubjectTrimmed}%,subject.ilike.%${searchSubjectTrimmed}%`,
        );
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setKeywordItems(data as IllustrationRecord[]);
      } else {
        setKeywordItems([]);
      }
      setKeywordLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    searchActionTrimmed,
    searchSubjectTrimmed,
    hasKeywordQuery,
    generatedResult,
  ]);

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

  const handleGenerate = async () => {
    if (!actionTrimmed || !subjectTrimmed) {
      alert("行動と対象を両方入力してください");
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setGeneratedResult(null);
    document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionTrimmed,
          subject: subjectTrimmed,
        }),
      });

      const result = await response.json();
      console.log("API result:", result);

      if (!response.ok) {
        throw new Error(result.error || "生成に失敗しました");
      }

      if (result.success && result.data?.[0]) {
        const row = result.data[0] as { title: string; image_url: string };
        setGeneratedResult({
          title: row.title,
          image_url: row.image_url,
        });
      } else {
        throw new Error("生成に失敗しました");
      }
    } catch (error) {
      setGenerateError(
        error instanceof Error
          ? error.message
          : "生成に失敗しました。もう一度お試しください。",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="home" />

      <main>
        <section className="mx-auto max-w-[680px] px-6 py-14 text-center sm:py-16">
          <h1 className="mb-4 text-[clamp(26px,5vw,48px)] font-extrabold leading-tight tracking-tight">
            世界の誰か1人にだけ
            <br />
            刺さるイラスト集
          </h1>
          <p className="mb-7 text-sm leading-[1.9] text-muted">
            あなたのイラストが世界の誰かの心に刺さりますように。
            <br />
            世界のどこかに掲載されますように。
          </p>
          <button
            type="button"
            onClick={scrollToGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-white"
          >
            ✦ イラストを作る（無料）
          </button>
          <GenerationCounter refreshKey={generatedResult?.image_url ?? null} />
          <br />
          <span className="mt-3 inline-block rounded-full border border-border bg-card px-3.5 py-1 text-xs text-muted-light">
            画像の生成・使用はすべて無料　商用利用OK
          </span>
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="new" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">🆕 新着イラスト</h2>
            <SectionLink href={buildCategoryHref({ cat: "new" })} />
          </div>
          <p className="mb-4 text-xs text-muted-light">
            作ったイラストは管理人の承認後に掲載されます。毎日23時頃に更新しています。
          </p>
          {newDbLoading ? (
            <NewIllustrationSkeletonGrid />
          ) : (
            <NewDbIllustrationGrid items={newDbItems} />
          )}
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="ranking" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">🏆 人気ランキング</h2>
            <Link
              href="/ranking"
              className="rounded-full border border-border px-3.5 py-1 text-[13px] text-muted no-underline transition-colors hover:border-foreground hover:bg-foreground hover:text-white"
            >
              もっと見る→
            </Link>
          </div>
          <p className="mb-4 text-xs text-muted-light">
            過去1ヶ月のダウンロード数 TOP3
          </p>
          {miniRankingLoading ? (
            <MiniRankingSkeleton />
          ) : (
            <RankingList items={miniRanking} compact />
          )}
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="category" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">📂 カテゴリから探す</h2>
            <SectionLink href={buildCategoryHref({ cat: currentCat })} />
          </div>
          <p className="mb-4 text-xs text-muted-light">大まかなジャンルから絞り込めます。</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {TOP_CATEGORY_CHIPS.map((category) => (
              <button
                key={category.key}
                type="button"
                disabled={category.soon}
                onClick={() => !category.soon && setCurrentCat(category.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                  category.soon
                    ? "cursor-default border-border bg-card opacity-40"
                    : currentCat === category.key
                      ? "border-foreground bg-foreground text-white"
                      : "cursor-pointer border-border bg-card hover:border-foreground hover:bg-foreground hover:text-white"
                }`}
              >
                <span>{category.emoji}</span>
                {category.name}
                {category.soon && (
                  <span className="ml-0.5 rounded-full bg-background-secondary px-1.5 py-px text-[10px] text-muted-light">
                    近日
                  </span>
                )}
              </button>
            ))}
          </div>
          <DbIllustrationSection
            items={categoryItems}
            loading={categoryLoading}
            emptyMessage="該当するイラストがありません"
          />
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="tags" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">🏷 タグから探す</h2>
            <SectionLink href={buildCategoryHref({ tags: [currentTag] })} />
          </div>
          <p className="mb-4 text-xs text-muted-light">行動のジャンルで絞り込めます。</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {TAG_FILTERS.map((tag) => (
              <button
                key={tag.key}
                type="button"
                onClick={() => setCurrentTag(tag.key)}
                className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
                  currentTag === tag.key
                    ? "border-accent-dark bg-accent text-foreground"
                    : "border-border bg-card hover:border-accent-dark hover:bg-accent"
                }`}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
          <DbIllustrationSection
            items={tagItems}
            loading={tagLoading}
            emptyMessage="該当するイラストがありません"
          />
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="search" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">🔍 キーワードから探す</h2>
            <SectionLink
              href={buildCategoryHref({
                action: searchAction,
                subject: searchSubject,
              })}
            />
          </div>
          <p className="mb-4 text-xs text-muted-light">
            「何をしている？」と「何が？」を入力して絞り込めます。
          </p>
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label
                htmlFor="search-action"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-light"
              >
                何をしている？
              </label>
              <input
                id="search-action"
                type="text"
                value={searchAction}
                onChange={(e) => setSearchAction(e.target.value)}
                placeholder="サッカー、勉強、料理…"
                className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-[13px] outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
              />
            </div>
            <div>
              <label
                htmlFor="search-subject"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-light"
              >
                何が？（動物など）
              </label>
              <input
                id="search-subject"
                type="text"
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                placeholder="ネコ、ワニ、ハムスター…"
                className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-[13px] outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
              />
              <span className="mt-1 block text-[11px] text-muted-light">
                漢字かカタカナで入力してください
              </span>
            </div>
            <Link
              href={buildCategoryHref({
                action: searchAction,
                subject: searchSubject,
              })}
              className="rounded-[var(--radius-sm)] bg-foreground px-4 py-2 text-center text-[13px] font-medium text-white no-underline"
            >
              検索
            </Link>
          </div>
          {hasKeywordQuery ? (
            <DbIllustrationSection
              items={keywordItems}
              loading={keywordLoading}
              emptyMessage="該当するイラストがありません"
            />
          ) : null}
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="generate" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">✦ イラストを作る</h2>
          </div>
          <p className="mb-4 text-xs text-muted-light">
            欲しいイラストが見つからないときはAIに作ってもらおう。
          </p>
          {generating ? (
            <GenerateLoadingScreen
              active={generating}
              title={`${actionTrimmed} ${subjectTrimmed}`}
            />
          ) : generatedResult ? (
            <GenerateResultScreen
              title={generatedResult.title}
              imageUrl={generatedResult.image_url}
              onCreateAnother={() => {
                setGeneratedResult(null);
                setGenerateError(null);
              }}
            />
          ) : (
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
                className="w-full rounded-[var(--radius-sm)] bg-foreground py-3.5 text-sm font-semibold text-white"
              >
                ✦ このイラストをAIで生成する（無料）
              </button>
              <p className="mt-2.5 text-center text-[11px] text-muted-light">
                生成したイラストは承認後にサイトに追加され、みんなが使えるようになります
              </p>
            </div>
          )}

          {generateError && !generating && (
            <p className="mt-4 max-w-[600px] text-center text-sm text-red-600">{generateError}</p>
          )}
        </section>

        <section id="how-to" className="bg-foreground px-4 py-12 sm:px-7">
          <div className="mx-auto max-w-[1044px]">
            <h2 className="mb-1.5 text-[22px] font-extrabold tracking-tight text-white">
              どうやって使うの？
            </h2>
            <p className="mb-8 text-[13px] text-white/40">
              3ステップで欲しいイラストがすぐ手に入ります
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
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

      <SiteFooter />
    </div>
  );
}
