export function SiteFooter() {
  return (
    <footer className="mt-10 flex flex-col items-center justify-between gap-3.5 border-t border-border px-4 py-6 sm:flex-row sm:px-7">
      <div className="text-[15px] font-bold">イラストくん</div>
      <nav className="flex gap-5">
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
  );
}
