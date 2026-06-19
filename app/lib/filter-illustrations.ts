import type { CategoryKey, Illustration, IllustrationTag } from "./illustrations";
import { CATEGORY_LABELS } from "./illustrations";
import { normalize } from "./normalize";

export type SortOption = "new" | "popular";
export type CategoryFilter = CategoryKey | "" | "new";

export type IllustrationFilters = {
  cat: CategoryFilter;
  tags: IllustrationTag[];
  action: string;
  subject: string;
  sort: SortOption;
};

export function filterIllustrations(
  items: Illustration[],
  filters: IllustrationFilters,
): Illustration[] {
  const normAction = normalize(filters.action.trim());
  const normSubject = normalize(filters.subject.trim());

  let result = items.filter((item) => {
    const catOk =
      !filters.cat || filters.cat === "new" || item.genre === filters.cat;
    const tagOk =
      filters.tags.length === 0 || filters.tags.includes(item.tag);
    const actionOk =
      !normAction ||
      normalize(item.action).includes(normAction) ||
      normalize(item.title).includes(normAction);
    const subjectOk =
      !normSubject ||
      normalize(item.subject).includes(normSubject) ||
      normalize(item.title).includes(normSubject);
    return catOk && tagOk && actionOk && subjectOk;
  });

  if (filters.sort === "popular") {
    result = [...result].sort((a, b) => b.downloads - a.downloads);
  } else {
    result = [...result].sort((a, b) => b.id - a.id);
  }

  return result;
}

export function buildCategoryHref(filters: Partial<IllustrationFilters>): string {
  const params = new URLSearchParams();
  if (filters.cat) params.set("cat", filters.cat);
  filters.tags?.forEach((tag) => params.append("tag", tag));
  if (filters.action?.trim()) params.set("action", filters.action.trim());
  if (filters.subject?.trim()) params.set("subject", filters.subject.trim());
  if (filters.sort && filters.sort !== "new") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `/category?${query}` : "/category";
}

export function parseCategorySearchParams(
  searchParams: URLSearchParams,
): IllustrationFilters {
  const cat = (searchParams.get("cat") || "") as CategoryFilter;
  const tags = searchParams.getAll("tag") as IllustrationTag[];
  const sort = (searchParams.get("sort") as SortOption) || "new";
  return {
    cat,
    tags,
    action: searchParams.get("action") || "",
    subject: searchParams.get("subject") || "",
    sort: sort === "popular" ? "popular" : "new",
  };
}

export function getCategoryPageMeta(filters: IllustrationFilters) {
  const catName =
    filters.cat === "new"
      ? "新着"
      : filters.cat === ""
        ? "すべて"
        : CATEGORY_LABELS[filters.cat as CategoryKey] ?? "すべて";
  const tagStr = filters.tags.length ? filters.tags.join("・") : "";
  let title = `${catName}のイラスト一覧`;
  if (tagStr) title += `（${tagStr}）`;
  return {
    title,
    breadcrumb: title,
    sub: `${catName}のフリーイラスト素材集。無料・商用利用OK。`,
    description: `${catName}のフリーイラスト一覧。無料でダウンロード・商用利用OK。`,
  };
}
