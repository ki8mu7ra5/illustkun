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
    title: "陦悟虚縺ｨ蟇ｾ雎｡繧貞・蜉・,
    description:
      "縲御ｽ輔ｒ縺励※縺・ｋ・溘阪御ｽ輔′・溘阪・2鬆・岼縺縺代ゅ・繝ｭ繝ｳ繝励ヨ縺ｮ遏･隴倥・荳蛻・ｸ崎ｦ√〒縺吶・,
  },
  {
    step: "Step 02",
    title: "AI縺後◎縺ｮ蝣ｴ縺ｧ逕滓・",
    description:
      "gpt-image-1縺檎ｴ・0遘偵〒繧､繝ｩ繧ｹ繝医ｒ逕滓・縲りレ譎ｯ騾城℃縺ｮPNG縺ｧ蜃ｺ蜉帙＆繧後∪縺吶・,
  },
  {
    step: "Step 03",
    title: "辟｡譁吶〒繝繧ｦ繝ｳ繝ｭ繝ｼ繝・,
    description:
      "逕滓・縺励◆繧､繝ｩ繧ｹ繝医・縺吶＄DL蜿ｯ閭ｽ縲よ価隱榊ｾ後↓繧ｵ繧､繝医↓霑ｽ蜉縺輔ｌ縲√∩繧薙↑縺御ｽｿ縺医ｋ繧医≧縺ｫ縺ｪ繧翫∪縺吶・,
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
  emptyMessage = "蜈ｬ髢倶ｸｭ縺ｮ繧､繝ｩ繧ｹ繝医・縺ｾ縺縺ゅｊ縺ｾ縺帙ｓ",
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
            {item.subject || item.sub_genre || item.genre}繝ｻ{formatRelativeTime(item.created_at)}
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
      繧ゅ▲縺ｨ隕九ｋ
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
  const [currentTag, setCurrentTag] = useState<IllustrationTag>("繧ｹ繝昴・繝・);
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
      "蜍慕黄縺ｨ陦悟虚繧貞・蜉帙＠縺ｦ縺上□縺輔＞"
    ) : (
      <>
        <strong className="text-foreground">
          {actionTrimmed || "___"} {subjectTrimmed || "___"}
        </strong>
        {" 縺ｮ繧､繝ｩ繧ｹ繝医ｒ逕滓・縺励∪縺・}
      </>
    );

  const handleGenerate = async () => {
    if (!actionTrimmed || !subjectTrimmed) {
      alert("陦悟虚縺ｨ蟇ｾ雎｡繧剃ｸ｡譁ｹ蜈･蜉帙＠縺ｦ縺上□縺輔＞");
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
        throw new Error(result.error || "逕滓・縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
      }

      if (result.success && result.data?.[0]) {
        const row = result.data[0] as { title: string; image_url: string };
        setGeneratedResult({
          title: row.title,
          image_url: row.image_url,
        });
      } else {
        throw new Error("逕滓・縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
      }
    } catch (error) {
      setGenerateError(
        error instanceof Error
          ? error.message
          : "逕滓・縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅｂ縺・ｸ蠎ｦ縺願ｩｦ縺励￥縺縺輔＞縲・,
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
            荳也阜縺ｮ隱ｰ縺・莠ｺ縺ｫ縺縺・            <br />
            蛻ｺ縺輔ｋ繧､繝ｩ繧ｹ繝磯寔
          </h1>
          <p className="mb-7 text-sm leading-[1.9] text-muted">
            縺ゅ↑縺溘・繧､繝ｩ繧ｹ繝医′荳也阜縺ｮ隱ｰ縺九・蠢・↓蛻ｺ縺輔ｊ縺ｾ縺吶ｈ縺・↓縲・            <br />
            荳也阜縺ｮ縺ｩ縺薙°縺ｫ謗ｲ霈峨＆繧後∪縺吶ｈ縺・↓縲・          </p>
          <button
            type="button"
            onClick={scrollToGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-white"
          >
            笨ｦ 繧､繝ｩ繧ｹ繝医ｒ菴懊ｋ・育┌譁呻ｼ・          </button>
          <GenerationCounter refreshKey={generatedResult?.image_url ?? null} />
          <br />
          <span className="mt-3 inline-block rounded-full border border-border bg-card px-3.5 py-1 text-xs text-muted-light">
            逕ｻ蜒上・逕滓・繝ｻ菴ｿ逕ｨ縺ｯ縺吶∋縺ｦ辟｡譁吶蝠・畑蛻ｩ逕ｨOK
          </span>
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="new" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">・ 譁ｰ逹繧､繝ｩ繧ｹ繝・/h2>
            <SectionLink href={buildCategoryHref({ cat: "new" })} />
          </div>
          <p className="mb-4 text-xs text-muted-light">
            菴懊▲縺溘う繝ｩ繧ｹ繝医・邂｡逅・ｺｺ縺ｮ謇ｿ隱榊ｾ後↓謗ｲ霈峨＆繧後∪縺吶よｯ取律23譎る・↓譖ｴ譁ｰ縺励※縺・∪縺吶・          </p>
          {newDbLoading ? (
            <NewIllustrationSkeletonGrid />
          ) : (
            <NewDbIllustrationGrid items={newDbItems} />
          )}
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="ranking" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">醇 莠ｺ豌励Λ繝ｳ繧ｭ繝ｳ繧ｰ</h2>
            <Link
              href="/ranking"
              className="rounded-full border border-border px-3.5 py-1 text-[13px] text-muted no-underline transition-colors hover:border-foreground hover:bg-foreground hover:text-white"
            >
              繧ゅ▲縺ｨ隕九ｋ竊・            </Link>
          </div>
          <p className="mb-4 text-xs text-muted-light">
            驕主悉1繝ｶ譛医・繝繧ｦ繝ｳ繝ｭ繝ｼ繝画焚 TOP3
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
            <h2 className="text-lg font-bold tracking-tight">唐 繧ｫ繝・ざ繝ｪ縺九ｉ謗｢縺・/h2>
            <SectionLink href={buildCategoryHref({ cat: currentCat })} />
          </div>
          <p className="mb-4 text-xs text-muted-light">螟ｧ縺ｾ縺九↑繧ｸ繝｣繝ｳ繝ｫ縺九ｉ邨槭ｊ霎ｼ繧√∪縺吶・/p>
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
                    霑第律
                  </span>
                )}
              </button>
            ))}
          </div>
          <DbIllustrationSection
            items={categoryItems}
            loading={categoryLoading}
            emptyMessage="隧ｲ蠖薙☆繧九う繝ｩ繧ｹ繝医′縺ゅｊ縺ｾ縺帙ｓ"
          />
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="tags" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">捷 繧ｿ繧ｰ縺九ｉ謗｢縺・/h2>
            <SectionLink href={buildCategoryHref({ tags: [currentTag] })} />
          </div>
          <p className="mb-4 text-xs text-muted-light">陦悟虚縺ｮ繧ｸ繝｣繝ｳ繝ｫ縺ｧ邨槭ｊ霎ｼ繧√∪縺吶・/p>
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
            emptyMessage="隧ｲ蠖薙☆繧九う繝ｩ繧ｹ繝医′縺ゅｊ縺ｾ縺帙ｓ"
          />
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="search" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">剥 繧ｭ繝ｼ繝ｯ繝ｼ繝峨°繧画爾縺・/h2>
            <SectionLink
              href={buildCategoryHref({
                action: searchAction,
                subject: searchSubject,
              })}
            />
          </div>
          <p className="mb-4 text-xs text-muted-light">
            縲御ｽ輔ｒ縺励※縺・ｋ・溘阪→縲御ｽ輔′・溘阪ｒ蜈･蜉帙＠縺ｦ邨槭ｊ霎ｼ繧√∪縺吶・          </p>
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label
                htmlFor="search-action"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-light"
              >
                菴輔ｒ縺励※縺・ｋ・・              </label>
              <input
                id="search-action"
                type="text"
                value={searchAction}
                onChange={(e) => setSearchAction(e.target.value)}
                placeholder="繧ｵ繝・き繝ｼ縲∝級蠑ｷ縲∵侭逅・ｦ"
                className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-[13px] outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
              />
            </div>
            <div>
              <label
                htmlFor="search-subject"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-light"
              >
                菴輔′・滂ｼ亥虚迚ｩ縺ｪ縺ｩ・・              </label>
              <input
                id="search-subject"
                type="text"
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                placeholder="繝阪さ縲√Ρ繝九√ワ繝繧ｹ繧ｿ繝ｼ窶ｦ"
                className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-[13px] outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
              />
              <span className="mt-1 block text-[11px] text-muted-light">
                貍｢蟄励°繧ｫ繧ｿ繧ｫ繝翫〒蜈･蜉帙＠縺ｦ縺上□縺輔＞
              </span>
            </div>
            <Link
              href={buildCategoryHref({
                action: searchAction,
                subject: searchSubject,
              })}
              className="rounded-[var(--radius-sm)] bg-foreground px-4 py-2 text-center text-[13px] font-medium text-white no-underline"
            >
              讀懃ｴ｢
            </Link>
          </div>
          {hasKeywordQuery ? (
            <DbIllustrationSection
              items={keywordItems}
              loading={keywordLoading}
              emptyMessage="隧ｲ蠖薙☆繧九う繝ｩ繧ｹ繝医′縺ゅｊ縺ｾ縺帙ｓ"
            />
          ) : null}
        </section>

        <hr className="border-0 border-t border-border" />

        <section id="generate" className="mx-auto max-w-[1100px] px-4 py-10 sm:px-7">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight">笨ｦ 繧､繝ｩ繧ｹ繝医ｒ菴懊ｋ</h2>
          </div>
          <p className="mb-4 text-xs text-muted-light">
            谺ｲ縺励＞繧､繝ｩ繧ｹ繝医′隕九▽縺九ｉ縺ｪ縺・→縺阪・AI縺ｫ菴懊▲縺ｦ繧ゅｉ縺翫≧縲・          </p>
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
              <div className="mb-1.5 text-base font-bold">谺ｲ縺励＞繧､繝ｩ繧ｹ繝医ｒ蜈･蜉帙＠縺ｦ縺上□縺輔＞</div>
              <p className="mb-5 text-[13px] text-muted">
                縲御ｽ輔ｒ縺励※縺・ｋ・溘搾ｼ九御ｽ輔′・溘阪・2鬆・岼縺縺代ゅ・繝ｭ繝ｳ繝励ヨ縺ｮ遏･隴倥・荳崎ｦ√〒縺吶・              </p>
              <div className="mb-3.5 grid grid-cols-1 items-center gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
                <div>
                  <label
                    htmlFor="action"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-light"
                  >
                    菴輔ｒ縺励※縺・ｋ・・                  </label>
                  <input
                    id="action"
                    type="text"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="髮ｻ霆翫ｒ驕玖ｻ｢縺励※縺・ｋ"
                    className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                  />
                  <span className="mt-1 block text-[11px] text-muted-light">
                    萓具ｼ壹し繝・き繝ｼ繧偵＠縺ｦ縺・ｋ縲譛ｬ繧定ｪｭ繧薙〒縺・ｋ
                  </span>
                </div>
                <div className="hidden text-center text-xl font-light text-muted-light sm:block">
                  ﾃ・                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-light"
                  >
                    菴輔′・・                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="繝阪さ"
                    className="w-full rounded-[var(--radius-sm)] border-[1.5px] border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                  />
                  <span className="mt-1 block text-[11px] text-muted-light">
                    萓具ｼ壹ワ繝繧ｹ繧ｿ繝ｼ縲繧ｴ繝ｪ繝ｩ縲繝ｯ繝・                  </span>
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
                笨ｦ 縺薙・繧､繝ｩ繧ｹ繝医ｒAI縺ｧ逕滓・縺吶ｋ・育┌譁呻ｼ・              </button>
              <p className="mt-2.5 text-center text-[11px] text-muted-light">
                逕滓・縺励◆繧､繝ｩ繧ｹ繝医・謇ｿ隱榊ｾ後↓繧ｵ繧､繝医↓霑ｽ蜉縺輔ｌ縲√∩繧薙↑縺御ｽｿ縺医ｋ繧医≧縺ｫ縺ｪ繧翫∪縺・              </p>
            </div>
          )}

          {generateError && !generating && (
            <p className="mt-4 max-w-[600px] text-center text-sm text-red-600">{generateError}</p>
          )}
        </section>

        <section id="how-to" className="bg-foreground px-4 py-12 sm:px-7">
          <div className="mx-auto max-w-[1044px]">
            <h2 className="mb-1.5 text-[22px] font-extrabold tracking-tight text-white">
              縺ｩ縺・ｄ縺｣縺ｦ菴ｿ縺・・・・            </h2>
            <p className="mb-8 text-[13px] text-white/40">
              3繧ｹ繝・ャ繝励〒谺ｲ縺励＞繧､繝ｩ繧ｹ繝医′縺吶＄謇九↓蜈･繧翫∪縺・            </p>
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
