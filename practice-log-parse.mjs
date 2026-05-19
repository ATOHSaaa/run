import { getActivityMenuListHref } from './activity-menus.mjs';

/** @param {string} s */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 行を「キー: 値」として解析（値は空でも可）。Activities 記事タイトル用に title も取る */
export function parseKeyValueLines(body) {
  const out = { menu: '', distance: '', pace: '', title: '' };
  for (const line of String(body).split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const m = t.match(/^([^:：]+)[:：]\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim();
    let field = null;
    if (/^(タイトル|記事タイトル|title)$/i.test(key)) field = 'title';
    else if (/練習|メニュー|^menu$/i.test(key)) field = 'menu';
    else if (/距離|^distance$/i.test(key)) field = 'distance';
    else if (/タイム|ペース|^pace$/i.test(key)) field = 'pace';
    if (field) out[field] = val;
  }
  return out;
}

/** 中黒系（キーボード・IME差で混在しがち） */
const DOT_SEP_RE = /\s*[・·･‧∙⋅]\s*/u;

/** `Jogging・10km・6:00 / km` のように中黒区切りの1〜3列 */
export function parseDotSeparated(body) {
  const single = String(body)
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
  const parts = single.split(DOT_SEP_RE).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      menu: parts[0],
      distance: parts[1],
      pace: parts.slice(2).join('・'),
      title: '',
    };
  }
  if (parts.length === 2) {
    return { menu: parts[0], distance: parts[1], pace: '', title: '' };
  }
  return { menu: '', distance: '', pace: '', title: '' };
}

/** 改行区切りで 2 行以上（行内に中黒なし）— 1 行目メニュー・2 行目距離・3 行目以降ペース。`練習:` 等のキー行は除外 */
export function parseNewlineSeparated(body) {
  const rawLines = String(body)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => {
      const m = l.match(/^([^:：]+)[:：]\s*(.*)$/);
      if (!m) return true;
      const key = m[1].trim();
      return !/^(タイトル|記事タイトル|title|練習|メニュー|menu|距離|distance|タイム|ペース|pace)$/i.test(key);
    });
  if (rawLines.length < 2) {
    return { menu: '', distance: '', pace: '', title: '' };
  }
  if (rawLines.some((l) => /[・·･‧∙⋅]/u.test(l))) {
    return { menu: '', distance: '', pace: '', title: '' };
  }
  if (rawLines.length >= 3) {
    return {
      menu: rawLines[0],
      distance: rawLines[1],
      pace: rawLines.slice(2).join(' '),
      title: '',
    };
  }
  return { menu: rawLines[0], distance: rawLines[1], pace: '', title: '' };
}

export function parsePracticeLogBody(body) {
  const kv = parseKeyValueLines(body);
  const dot = parseDotSeparated(body);
  const nl = parseNewlineSeparated(body);
  const merged = {
    title: kv.title || dot.title || nl.title,
    menu: kv.menu || dot.menu || nl.menu,
    distance: kv.distance || dot.distance || nl.distance,
    pace: kv.pace || dot.pace || nl.pace,
  };
  return merged;
}

export function looksLikePracticeLog(body) {
  const p = parsePracticeLogBody(body);
  return !!(p.menu || p.distance || p.pace || p.title);
}

/** メニュー・距離・ペースのいずれかが埋まっている（空カードを出さない判定用） */
export function hasPracticeLogMetrics(p) {
  return !!(
    String(p.menu ?? '').trim() ||
    String(p.distance ?? '').trim() ||
    String(p.pace ?? '').trim()
  );
}

/** メニュー文言から記事詳細用の BEM 修飾子（なければ null） */
export function practiceLogMenuActivityModifier(menu) {
  const s = String(menu ?? '').trim();
  if (!s) return null;
  if (/トレッキング/u.test(s)) return 'trekking';
  if (s.includes('ジョギング')) return 'jogging';
  if (/トレラン|トレイルラン|トレイルランニング/u.test(s)) return 'trail-run';
  if (/trail\s*-?\s*run/i.test(s)) return 'trail-run';
  return null;
}

/** 距離・ペースのうち、表示上「最後」のフィールド */
export function practiceLogLastMetricField(parsed) {
  if (String(parsed.pace ?? '').trim()) return 'pace';
  if (String(parsed.distance ?? '').trim()) return 'distance';
  return null;
}

function formatPracticeMetricHtml(field, value, { isTrekking, lastField }) {
  const display = value || '—';
  const hasValue = String(value ?? '').trim();
  if (!hasValue) return esc(display);

  let className = 'article__practice-log__pace';
  if (field === 'distance') {
    className = 'article__practice-log__dist';
  } else if (isTrekking && field === lastField && lastField === 'pace') {
    className = 'article__practice-log__ascent';
  }
  return `<span class="${className}">${esc(display)}</span>`;
}

/** 表示用（HTML 埋め込み）: 活動種別に応じて span + ::before 用クラス */
export function formatPracticeLineHtml(p, options = {}) {
  const { base = '' } = options;
  const m = p.menu || '—';
  const d = p.distance || '—';
  const t = p.pace || '—';
  const rawMenu = String(p.menu ?? '').trim();
  const hasDist = String(p.distance ?? '').trim();
  const hasPace = String(p.pace ?? '').trim();
  const activityMod = practiceLogMenuActivityModifier(rawMenu);
  const isTrekking = activityMod === 'trekking';
  const lastField = practiceLogLastMetricField(p);

  const menuInner =
    rawMenu && activityMod
      ? `<span class="article__practice-log__menu article__practice-log__menu--${activityMod}">${esc(m)}</span>`
      : esc(m);
  const menuHref = rawMenu && activityMod ? getActivityMenuListHref(base, activityMod) : null;
  const menuHtml =
    menuHref != null
      ? `<a class="article__practice-log__menu-link" href="${esc(menuHref)}">${menuInner}</a>`
      : menuInner;
  const distHtml = hasDist
    ? formatPracticeMetricHtml('distance', d, { isTrekking, lastField })
    : esc(d);
  const paceHtml = hasPace
    ? formatPracticeMetricHtml('pace', t, { isTrekking, lastField })
    : esc(t);
  const sep = '<span class="article__practice-log__sep" aria-hidden="true">・</span>';
  return `${menuHtml}${sep}${distHtml}${sep}${paceHtml}`;
}

/** プレーンテキスト1行（互換・テスト用） */
export function formatPracticeLine(p) {
  const m = p.menu || '—';
  const d = p.distance || '—';
  const t = p.pace || '—';
  return `${esc(m)}・${esc(d)}・${esc(t)}`;
}

export function shouldTransformFirstFence(node) {
  const lang = (node.lang ?? '').trim().split(/\s+/)[0] ?? '';
  if (lang === 'practice-log' || lang === 'tips-run') return true;
  return looksLikePracticeLog(node.value ?? '');
}

/**
 * 記事詳細用: 活動1行（枠なし）。ジョギング時はメニュー左にランナー、距離・ペースは各左にアイコン用 span。
 * @param {{ menu?: string; distance?: string; pace?: string; title?: string }} parsed
 */
export function buildPracticeLogAsideHtml(parsed, options = {}) {
  const inner = formatPracticeLineHtml(parsed, options);
  return `<p class="article__practice-log" role="note" aria-label="練習メニュー">${inner}</p>`;
}

/**
 * Markdown 本文から先頭フェンスを解釈し、カード HTML とタイトル行を返す（remark と二重にならないよう同一ロジック）。
 * @param {string} markdown
 * @returns {{ html: string; title: string } | null}
 */
export function getPracticeLogAsideFromMarkdownBody(markdown, options = {}) {
  const info = extractFirstCodeFenceInfo(markdown);
  if (!info) return null;
  if (!shouldTransformFirstFence({ lang: info.lang, value: info.value })) return null;
  const parsed = parsePracticeLogBody(info.value ?? '');
  const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
  if (!hasPracticeLogMetrics(parsed)) {
    if (!title) return null;
    return { html: undefined, title };
  }
  const html = buildPracticeLogAsideHtml(parsed, options);
  return { html, title };
}

/**
 * Markdown 本文（フロントマター除く）から最初のコードフェンスの中身を取る。
 * @param {string} markdown
 */
export function extractFirstCodeFenceRaw(markdown) {
  const info = extractFirstCodeFenceInfo(markdown);
  return info ? info.value : null;
}

/**
 * 本文先頭のコードフェンス（言語タグ付き）を取る。
 * @param {string} markdown
 * @returns {{ lang: string; value: string } | null}
 */
export function extractFirstCodeFenceInfo(markdown) {
  const s = String(markdown);
  const re = /^[\s\uFEFF]*```([^\r\n]*)\r?\n([\s\S]*?)\r?\n```/m;
  const m = s.match(re);
  if (!m) return null;
  const first = m[1].trim();
  const lang = first.split(/\s+/)[0] ?? '';
  return { lang, value: m[2] };
}

/**
 * 走行距離文字列から km 数値を取る（未対応なら null）。
 * 例: "10km", "2.1 km", "5 キロ"
 * @param {string} distanceStr
 * @returns {number | null}
 */
export function parseDistanceKm(distanceStr) {
  if (!distanceStr || !String(distanceStr).trim()) return null;
  const s = String(distanceStr).trim().replace(/，/g, ',');
  const m = s.match(/([\d]+(?:[.,]\d+)?)\s*(?:km|㎞|キロ)(?![a-zA-Z])/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
