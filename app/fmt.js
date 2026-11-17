// Tiny formatting helpers: money, dates, countdowns, safe HTML.
export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
}

export function usd(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

export function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '—';
}

// Win rate stored as micro units (956066 = 95.6066%) as a percent string.
export function pct(micro) {
  const n = Number(micro);
  if (!Number.isFinite(n)) return '—';
  return (n / 10000).toFixed(2) + '%';
}

export function when(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) + ' UTC';
}

// Time left: "2d 4h left", "5h 12m left", "38m left", "ended". Also returns a class hint.
export function left(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return { text: 'ended', cls: 'over' };
  const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
  const text = d > 0 ? d + 'd ' + h + 'h left' : h > 0 ? h + 'h ' + m + 'm left' : m + 'm left';
  return { text, cls: ms < 86400000 ? 'soon' : '' };
}

export function open(iso) {
  return new Date(iso).getTime() > Date.now();
}
