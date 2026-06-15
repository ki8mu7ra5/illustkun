import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadButton } from "@/app/illustration/[id]/download-button";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import {
  buildGenreCategoryHref,
  fetchApprovedIllustration,
} from "@/app/lib/illustration-db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const illustration = await fetchApprovedIllustration(id);

  if (!illustration) {
    return {
      title: "イラストが見つかりません | イラストくん",
    };
  }

  const description =
    illustration.description ||
    `${illustration.title}のフリーイラスト。無料・商用利用OK・クレジット表記不要。`;

  return {
    title: `${illustration.title} | イラストくん`,
    description,
    openGraph: {
      title: `${illustration.title} | イラストくん`,
      description,
      images: [{ url: illustration.image_url, alt: illustration.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${illustration.title} | イラストくん`,
      description,
      images: [illustration.image_url],
    },
  };
}

export default async function IllustrationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const illustration = await fetchApprovedIllustration(id);

  if (!illustration) {
    notFound();
  }

  const categoryHref = buildGenreCategoryHref(illustration.genre);

  return (
    <div className="min-h-full bg-background text-foreground">
      <SiteHeader variant="category" />

      <main className="mx-auto max-w-[900px] px-4 py-6 sm:px-7 sm:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-light">
          <Link href="/" className="text-muted no-underline hover:text-foreground">
            トップ
          </Link>
          <span aria-hidden>›</span>
          <Link
            href={categoryHref}
            className="text-muted no-underline hover:text-foreground"
          >
            {illustration.genre}
          </Link>
          <span aria-hidden>›</span>
          <span className="text-foreground">{illustration.title}</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-center bg-background-secondary p-6 sm:p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={illustration.image_url}
              alt={illustration.title}
              className="max-h-[min(70vh,640px)] w-full max-w-[640px] object-contain"
            />
          </div>

          <div className="border-t border-border p-6 sm:p-8">
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {illustration.title}
            </h1>

            <p className="mb-4 text-sm text-muted">
              ジャンル: {illustration.genre}
              {illustration.sub_genre ? ` / ${illustration.sub_genre}` : ""}
            </p>

            {illustration.tags && illustration.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {illustration.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent/30 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {illustration.description && (
              <p className="mb-6 text-sm leading-relaxed text-muted">
                {illustration.description}
              </p>
            )}

            <DownloadButton
              imageUrl={illustration.image_url}
              title={illustration.title}
            />

            <div className="mt-6 rounded-xl border border-border bg-background-secondary p-4">
              <h2 className="mb-2 text-sm font-bold">このイラストを使う</h2>
              <ul className="space-y-1 text-xs leading-relaxed text-muted">
                <li>・商用利用OK</li>
                <li>・クレジット表記不要</li>
                <li>・改変NG</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
