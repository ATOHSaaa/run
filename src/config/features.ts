/**
 * Activities をサイト全体の記事一覧・検索などに載せるか（専用 `/blog/` ルートはなし）。
 * タグ一覧・`/tags/{tag}/` はこの値に関係なく Activities を含む（例: #江津湖）。
 * トップの Activities ブロックも常に表示。
 * 再開するときは true に変更。
 */
export const SHOW_PRACTICE_DIARY = false;

/** トップ Activities 内の月カレンダーを表示するか。 */
export const SHOW_ACTIVITIES_CALENDAR = true;
