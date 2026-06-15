import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-10 flex flex-col items-center justify-between gap-3.5 border-t border-border px-4 py-6 sm:flex-row sm:px-7">
      <div className="text-[15px] font-bold">イラストくん</div>
      <nav className="flex gap-5">
        <Link href="/terms" className="text-xs text-muted-light no-underline hover:text-foreground">
          利用規約
        </Link>
        <Link href="/privacy" className="text-xs text-muted-light no-underline hover:text-foreground">
          プライバシーポリシー
        </Link>
        <a href="#" className="text-xs text-muted-light no-underline hover:text-foreground">
          お問い合わせ
        </a>
      </nav>
      <div className="text-xs text-muted-light">
        © {new Date().getFullYear()} イラストくん
      </div>
    </footer>
  );
}
