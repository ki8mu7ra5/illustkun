"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  approveIllustration,
  getApprovedIllustrations,
  getPendingIllustrations,
  rejectIllustration,
} from "@/app/admin/actions";
import type { IllustrationRecord } from "@/app/lib/illustration-db";

const ADMIN_PASSWORD_KEY = "illustkun_admin_password";

function IllustrationMeta({ item }: { item: IllustrationRecord }) {
  return (
    <>
      <h2 className="mb-1 text-sm font-bold">{item.title}</h2>
      <p className="mb-1 text-xs text-muted">
        ジャンル: {item.genre}
        {item.sub_genre ? ` / ${item.sub_genre}` : ""}
      </p>
      {item.tags && item.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-accent/30 px-2 py-0.5 text-[10px] text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState<string | null>(null);
  const [items, setItems] = useState<IllustrationRecord[]>([]);
  const [approvedItems, setApprovedItems] = useState<IllustrationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PASSWORD_KEY);
    if (saved) setStoredPassword(saved);
  }, []);

  const fetchAll = useCallback(async (adminPassword: string) => {
    setLoading(true);
    setError(null);

    const [pendingResult, approvedResult] = await Promise.all([
      getPendingIllustrations(adminPassword),
      getApprovedIllustrations(adminPassword),
    ]);

    if (pendingResult.error) {
      setError(pendingResult.error);
      setItems([]);
    } else {
      setItems(pendingResult.data ?? []);
    }

    if (approvedResult.error) {
      setError(approvedResult.error);
      setApprovedItems([]);
    } else {
      setApprovedItems(approvedResult.data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (storedPassword) fetchAll(storedPassword);
  }, [storedPassword, fetchAll]);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
    setStoredPassword(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setStoredPassword(null);
    setPassword("");
    setItems([]);
    setApprovedItems([]);
  };

  const handleApprove = async (id: string) => {
    if (!storedPassword) return;
    setProcessingId(id);
    const result = await approveIllustration(storedPassword, id);
    if (result.error) {
      alert(result.error);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (result.data) {
        setApprovedItems((prev) => [result.data, ...prev]);
      }
    }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    if (!storedPassword) return;
    if (!confirm("このイラストを却下（削除）しますか？")) return;
    setProcessingId(id);
    const result = await rejectIllustration(storedPassword, id);
    if (result.error) {
      alert(result.error);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    setProcessingId(null);
  };

  const handleDeleteApproved = async (id: string) => {
    if (!storedPassword) return;
    if (!confirm("このイラストを削除しますか？")) return;
    setProcessingId(id);

    const response = await fetch(`/api/admin/illustrations/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": storedPassword },
    });
    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "削除に失敗しました");
    } else {
      setApprovedItems((prev) => prev.filter((item) => item.id !== id));
    }

    setProcessingId(null);
  };

  if (!storedPassword) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-xl border border-border bg-card p-6"
        >
          <h1 className="mb-1 text-lg font-bold">管理画面</h1>
          <p className="mb-4 text-sm text-muted">パスワードを入力してください</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent-dark"
            placeholder="ADMIN_PASSWORD"
          />
          <button
            type="submit"
            className="w-full rounded-[var(--radius-sm)] bg-foreground py-2.5 text-sm font-semibold text-white"
          >
            ログイン
          </button>
          <Link href="/" className="mt-4 block text-center text-xs text-muted no-underline">
            ← トップに戻る
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3 sm:px-7">
          <div>
            <h1 className="text-lg font-bold">管理画面</h1>
            <p className="text-xs text-muted-light">承認待ち・公開中イラスト</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-muted no-underline hover:text-foreground">
              トップ
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7">
        {loading && <p className="text-sm text-muted">読み込み中…</p>}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <section className="mb-12">
          <h2 className="mb-4 text-base font-bold">承認待ち</h2>

          {!loading && items.length === 0 && !error && (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted">
              承認待ちのイラストはありません
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="aspect-square border-b border-border bg-background-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <IllustrationMeta item={item} />
                  {item.description && (
                    <p className="mb-3 text-xs text-muted-light">{item.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={processingId === item.id}
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 rounded-[var(--radius-sm)] bg-foreground py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      承認
                    </button>
                    <button
                      type="button"
                      disabled={processingId === item.id}
                      onClick={() => handleReject(item.id)}
                      className="flex-1 rounded-[var(--radius-sm)] border border-border py-2 text-xs font-semibold text-muted hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      却下
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-base font-bold">公開中のイラスト</h2>

          {!loading && approvedItems.length === 0 && !error && (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted">
              公開中のイラストはありません
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {approvedItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="aspect-square border-b border-border bg-background-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <IllustrationMeta item={item} />
                  <button
                    type="button"
                    disabled={processingId === item.id}
                    onClick={() => handleDeleteApproved(item.id)}
                    className="w-full rounded-[var(--radius-sm)] border border-border py-2 text-xs font-semibold text-muted hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
