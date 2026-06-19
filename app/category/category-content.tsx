"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryIllustrationCard } from "../components/category-illustration-card";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import {
  buildCategoryHref,
  getCategoryPageMeta,
  parseCategorySearchParams,
  type CategoryFilter,
  type IllustrationFilters,
  type SortOption,
} from "../lib/filter-illustrations";
import {
  fetchApprovedIllustrationsList,
  type IllustrationRecord,
} from "../lib/illustration-db";
import { CATEGORY_CHIPS, TAG_FILTERS, type IllustrationTag } from "../lib/illustrations";

const PER_PAGE = 20;

export function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IllustrationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(
    () => parseCategorySearchParams(searchParams),
    [searchParams],
  );

  useEffect(() => {
    setPage(1);
  }, [filters.action, filters.subject, filters.cat, filters.tags.join(","), filters.sort]);

  useEffect(() => {
    let cancelled = false;

    async function loadIllustrations() {
      setLoading(true);
      const data = await fetchApprovedIllustrationsList(filters);
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    }

    loadIllustrations();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const pageMeta = useMemo(() => getCategoryPageMeta(filters), [filters]);

  useEffect(() => {
    document.title = `${pageMeta.title} - イラストくん`;
  }, [pageMeta.title]);

  const shown = useMemo(
    () => items.slice(0, page * PER_PAGE),
    [items, page],
  );

  const highlightKeywords = [filters.action, filters.subject].filter(Boolean);

  const pushFilters = useCallback(
    (next: Partial<IllustrationFilters>) => {
      const merged: IllustrationFilters = { ...filters, ...next };
      router.push(buildCategoryHref(merged));
    },
    [filters, router],
  );

  const setCat = (cat: CategoryFilter) => {
    pushFilters({ cat });
  };

  const toggleTag = (tag: IllustrationTag) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    pushFilters({ tags });
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="category" />

      <div className="mx-auto max-w-[1100px] px-4 pt-8 sm:px-7">
        <nav className="mb-3 text-xs text-muted-light">
          <Link href="/" className="text-muted no-underline hover:text-foreground">
            トップ
          </Link>
          {" › "}
          <span>{pageMeta.breadcrumb}</span>
        </nav>
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight">{pageMeta.title}</h1>
        <p className="mb-6 text-[13px] text-muted">{pageMeta.sub}</p>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 pb-10 sm:px-7">
        <div className="mb-6 rounded-xl border border-border bg-card px-6 py-5">
          <div className="mb-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-light">
              カテゴリ
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_CHIPS.map((category) => (
                <button
                  key={category.key || "all"}
                  type="button"
                  onClick={() => setCat(category.key as CategoryFilter)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
                    filters.cat === category.key
                      ? "border-foreground bg-foreground text-white"
                      : "cursor-pointer border-border bg-background hover:border-foreground hover:bg-foreground hover:text-white"
                  }`}
                >
                  {category.emoji && <span>{category.emoji}</span>}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-light">
              タグ（行動）
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TAG_FILTERS.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => toggleTag(tag.key)}
                  className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
                    filters.tags.includes(tag.key)
                      ? "border-accent-dark bg-accent text-foreground"
                      : "border-border bg-background hover:border-accent-dark hover:bg-accent"
                  }`}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-light">
              キーワード
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label
                  htmlFor="cat-search-action"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-light"
                >
                  何をしている？
                </label>
                <input
                  id="cat-search-action"
                  type="text"
                  value={filters.action}
                  onChange={(e) => pushFilters({ action: e.target.value })}
                  placeholder="サッカー、勉強、料理…"
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-background-secondary px-3 py-2 text-[13px] outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                />
              </div>
              <div>
                <label
                  htmlFor="cat-search-subject"
                  className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-light"
                >
                  何が？（動物など）
                </label>
                <input
                  id="cat-search-subject"
                  type="text"
                  value={filters.subject}
                  onChange={(e) => pushFilters({ subject: e.target.value })}
                  placeholder="ネコ、ワニ、ハムスター…"
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-background-secondary px-3 py-2 text-[13px] outline-none transition-[border-color,background] focus:border-accent-dark focus:bg-card"
                />
              </div>
              <button
                type="button"
                onClick={() => pushFilters({})}
                className="rounded-[var(--radius-sm)] bg-foreground px-4 py-2 text-[13px] font-medium text-white"
              >
                検索
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] text-muted">
            <strong className="font-bold text-foreground">{items.length}</strong>
            件のイラスト
          </p>
          <select
            value={filters.sort}
            onChange={(e) => pushFilters({ sort: e.target.value as SortOption })}
            className="cursor-pointer rounded-[var(--radius-sm)] border border-border bg-background px-3 py-1.5 text-[13px] outline-none"
          >
            <option value="new">新着順</option>
            <option value="popular">人気順</option>
          </select>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-muted-light">読み込み中…</p>
        ) : shown.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {shown.map((item) => (
              <CategoryIllustrationCard
                key={item.id}
                item={item}
                highlightKeywords={highlightKeywords}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-light">
            該当するイラストが見つかりませんでした
          </p>
        )}

        {!loading && items.length > shown.length && (
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="mx-auto mt-7 block w-full max-w-[300px] rounded-full border-[1.5px] border-border bg-transparent py-3 text-sm text-muted transition-colors hover:border-foreground hover:bg-card hover:text-foreground"
          >
            さらに読み込む
          </button>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
