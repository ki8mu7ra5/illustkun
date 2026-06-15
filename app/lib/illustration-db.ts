export type IllustrationRecord = {
  id: string;
  title: string;
  image_url: string;
  genre: string;
  sub_genre: string | null;
  action: string | null;
  subject: string | null;
  tags: string[] | null;
  description: string | null;
  approved: boolean;
  created_at: string;
  download_count: number;
};

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}
