import { NextResponse } from "next/server";
import { adminSupabase } from "@/app/lib/supabase-admin";

function getJstDayBounds(): { start: string; end: string } {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return {
    start: `${datePart}T00:00:00+09:00`,
    end: `${datePart}T23:59:59.999+09:00`,
  };
}

export async function GET() {
  try {
    const { start, end } = getJstDayBounds();

    const [totalResult, todayResult] = await Promise.all([
      adminSupabase
        .from("illustrations")
        .select("*", { count: "exact", head: true }),
      adminSupabase
        .from("illustrations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start)
        .lte("created_at", end),
    ]);

    if (totalResult.error) {
      throw totalResult.error;
    }
    if (todayResult.error) {
      throw todayResult.error;
    }

    return NextResponse.json({
      total: totalResult.count ?? 0,
      today: todayResult.count ?? 0,
    });
  } catch (error) {
    console.error("Generation stats error:", error);
    const message =
      error instanceof Error ? error.message : "統計の取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
