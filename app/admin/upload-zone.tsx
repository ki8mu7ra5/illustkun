"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

type AdminUploadZoneProps = {
  password: string;
  onUploaded: () => void;
};

export function AdminUploadZone({ password, onUploaded }: AdminUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください");
        setMessage(null);
        return;
      }

      setUploading(true);
      setError(null);
      setMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "x-admin-password": password },
          body: formData,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "アップロードに失敗しました");
        }

        const uploadedTitle = result.data?.[0]?.title ?? file.name;
        setMessage(`「${uploadedTitle}」を公開しました`);
        onUploaded();
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "アップロードに失敗しました",
        );
      } finally {
        setUploading(false);
      }
    },
    [password, onUploaded],
  );

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  return (
    <section className="mb-12">
      <h2 className="mb-2 text-base font-bold">管理人アップロード</h2>
      <p className="mb-4 text-xs text-muted-light">
        画像をドロップすると白背景を透明化し、自動分類のうえ即公開されます
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? "border-accent-dark bg-accent/20"
            : "border-border bg-card hover:border-accent-dark hover:bg-accent/10"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <span className="mb-2 text-3xl">📤</span>
        <p className="text-sm font-semibold">
          {uploading ? "アップロード中…" : "画像をドラッグ＆ドロップ"}
        </p>
        <p className="mt-1 text-xs text-muted">またはクリックしてファイルを選択</p>
        <p className="mt-3 text-[11px] text-muted-light">
          PNG / JPG など · ファイル名がタイトルになります
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
