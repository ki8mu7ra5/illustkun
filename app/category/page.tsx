import { Suspense } from "react";
import { CategoryContent } from "./category-content";

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-background text-muted">
          読み込み中…
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
