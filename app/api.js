// Read-only client for the make.fun public API, with a small ETag cache.
// One request per view: the board list is fetched once and reused, and every
// answer is kept in sessionStorage with its ETag so a repeat view revalidates
// with If-None-Match (a 304 costs almost nothing) instead of downloading again.
const API = 'https://make.fun/api';

function readCache(path) {
  try {
    const raw = sessionStorage.getItem('mf:' + path);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCache(path, etag, body) {
  try { sessionStorage.setItem('mf:' + path, JSON.stringify({ e: etag, b: body })); } catch { /* storage full or blocked: just skip */ }
}

export async function get(path) {
  const hit = readCache(path);
  const headers = {};
  if (hit && hit.e) headers['If-None-Match'] = hit.e;
  const res = await fetch(API + path, { headers });
  if (res.status === 304 && hit) return hit.b;
  // A failed revalidation still leaves the last good answer usable.
  if (!res.ok && hit) return hit.b;
  if (!res.ok) throw new Error('make.fun answered ' + res.status + ' for ' + path);
  const body = await res.json();
  writeCache(path, res.headers.get('ETag'), body);
  return body;
}

// The live board: open bounties with pot, fee and deadline in one call.
export const list = () => get('/competitions?status=open&activity=times');

// One bounty, with summary, description, rules and live rewards.
export const bounty = (slug) => get('/competitions/' + encodeURIComponent(slug));

// A bounty's leaderboard: the API returns every ranked entry in one call,
// so paging happens on the client and costs no extra request.
export const board = (slug) => get('/competitions/' + encodeURIComponent(slug) + '/leaderboard');

// An account's public profile, with its entries and scores.
export const profile = (handle) => get('/profiles/' + encodeURIComponent(handle));
