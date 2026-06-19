"use client";

import { useEffect, useState } from "react";
import { updateIllustration, type IllustrationUpdatePayload } from "@/app/admin/actions";
import { ACTION_CATEGORY_TAGS } from "@/app/lib/classify";
import type { IllustrationRecord } from "@/app/lib/illustration-db";

const GENRE_OPTIONS = [
  "動物",
  "食べ物",
  "乗り物",
  "植物",
  "人物",
  "スポーツ",
  "音楽",
] as const;

type IllustrationEditFormProps = {
  item: IllustrationRecord;
  password: string;
  disabled?: boolean;
  onUpdated: (item: IllustrationRecord) => void;
};

function toFormState(item: IllustrationRecord): IllustrationUpdatePayload {
  return {
    title: item.title,
    genre: item.genre,
    sub_genre: item.sub_genre,
    action: item.action,
    subject: item.subject,
    tags: item.tags ?? [],
    description: item.description,
  };
}

export function IllustrationEditForm({
  item,
  password,
  disabled = false,
  onUpdated,
}: IllustrationEditFormProps) {
  const [form, setForm] = useState<IllustrationUpdatePayload>(() => toFormState(item));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(toFormState(item));
    setSaved(false);
    setError(null);
  }, [item]);

  const toggleTag = (tag: string) => {
    setSaved(false);
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((value) => value !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateIllustration(password, item.id, form);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setForm(toFormState(result.data));
      onUpdated(result.data);
      setSaved(true);
    }

    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={`title-${item.id}`} className="mb-1 block text-[10px] font-semibold text-muted">
          タイトル
        </label>
        <input
          id={`title-${item.id}`}
          type="text"
          value={form.title}
          disabled={disabled || saving}
          onChange={(event) => {
            setSaved(false);
            setForm((prev) => ({ ...prev, title: event.target.value }));
          }}
          className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent-dark disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`genre-${item.id}`} className="mb-1 block text-[10px] font-semibold text-muted">
            カテゴリ
          </label>
          <select
            id={`genre-${item.id}`}
            value={form.genre}
            disabled={disabled || saving}
            onChange={(event) => {
              setSaved(false);
              setForm((prev) => ({ ...prev, genre: event.target.value }));
            }}
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent-dark disabled:opacity-50"
          >
            {GENRE_OPTIONS.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`sub-genre-${item.id}`} className="mb-1 block text-[10px] font-semibold text-muted">
            サブカテゴリ
          </label>
          <input
            id={`sub-genre-${item.id}`}
            type="text"
            value={form.sub_genre ?? ""}
            disabled={disabled || saving}
            onChange={(event) => {
              setSaved(false);
              setForm((prev) => ({ ...prev, sub_genre: event.target.value || null }));
            }}
            placeholder="例：猫、犬"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent-dark disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`action-${item.id}`} className="mb-1 block text-[10px] font-semibold text-muted">
            行動
          </label>
          <input
            id={`action-${item.id}`}
            type="text"
            value={form.action ?? ""}
            disabled={disabled || saving}
            onChange={(event) => {
              setSaved(false);
              setForm((prev) => ({ ...prev, action: event.target.value || null }));
            }}
            placeholder="例：勉強、料理"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent-dark disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor={`subject-${item.id}`} className="mb-1 block text-[10px] font-semibold text-muted">
            被写体
          </label>
          <input
            id={`subject-${item.id}`}
            type="text"
            value={form.subject ?? ""}
            disabled={disabled || saving}
            onChange={(event) => {
              setSaved(false);
              setForm((prev) => ({ ...prev, subject: event.target.value || null }));
            }}
            placeholder="例：ハムスター、猫"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent-dark disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold text-muted">タグ</p>
        <div className="flex flex-wrap gap-1.5">
          {ACTION_CATEGORY_TAGS.map((tag) => {
            const selected = form.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                disabled={disabled || saving}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors disabled:opacity-50 ${
                  selected
                    ? "bg-accent text-foreground"
                    : "border border-border bg-background text-muted hover:border-accent-dark"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor={`description-${item.id}`} className="mb-1 block text-[10px] font-semibold text-muted">
          説明文
        </label>
        <textarea
          id={`description-${item.id}`}
          value={form.description ?? ""}
          disabled={disabled || saving}
          rows={2}
          onChange={(event) => {
            setSaved(false);
            setForm((prev) => ({ ...prev, description: event.target.value || null }));
          }}
          className="w-full resize-none rounded-[var(--radius-sm)] border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-accent-dark disabled:opacity-50"
        />
      </div>

      {error && <p className="text-[10px] text-red-600">{error}</p>}
      {saved && !error && <p className="text-[10px] text-green-700">保存しました</p>}

      <button
        type="button"
        disabled={disabled || saving}
        onClick={handleSave}
        className="w-full rounded-[var(--radius-sm)] border border-border py-2 text-xs font-semibold text-foreground hover:border-accent-dark disabled:opacity-50"
      >
        {saving ? "保存中…" : "情報を保存"}
      </button>
    </div>
  );
}
