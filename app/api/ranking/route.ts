import { NextResponse } from "next/server";
import { fetchMonthlyRanking } from "@/app/lib/illustration-db";

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "10"), 1), 10);

  try {
    const ranking = await fetchMonthlyRanking(limit);
    return NextResponse.json(ranking);
  } catch (error) {
    console.error("Ranking API error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
