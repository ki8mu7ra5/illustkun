import Link from "next/link";

type SiteHeaderProps = {
  variant?: "home" | "category";
};

export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3 sm:px-7">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-foreground no-underline"
        >
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
          イラストくん
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          {variant === "home" ? (
            <>
              <Link
                href="/#new"
                className="hidden text-[13px] text-muted no-underline transition-colors hover:text-foreground sm:inline"
              >
                新着
              </Link>
              <Link
                href="/#category"
                className="hidden text-[13px] text-muted no-underline transition-colors hover:text-foreground sm:inline"
              >
                カテゴリ
              </Link>
              <Link
                href="/#tags"
                className="hidden text-[13px] text-muted no-underline transition-colors hover:text-foreground sm:inline"
              >
                タグ
              </Link>
              <Link
                href="/#search"
                className="hidden text-[13px] text-muted no-underline transition-colors hover:text-foreground sm:inline"
              >
                検索
              </Link>
              <Link
                href="/#generate"
                className="rounded-full bg-foreground px-4 py-1.5 text-[13px] font-medium text-white no-underline"
              >
                イラストを作る
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="hidden text-[13px] text-muted no-underline transition-colors hover:text-foreground sm:inline"
              >
                トップ
              </Link>
              <Link
                href="/category?cat=new"
                className="hidden text-[13px] text-muted no-underline transition-colors hover:text-foreground sm:inline"
              >
                新着
              </Link>
              <Link
                href="/#generate"
                className="rounded-full bg-foreground px-4 py-1.5 text-[13px] font-medium text-white no-underline"
              >
                イラストを作る
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
