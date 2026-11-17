// Detail views, loaded only when a route needs them, so the first load
// stays tiny: the bounty page, its leaderboard (paged on the client),
// and an account's public profile.
import { esc, left, num, open, pct, usd, when } from './fmt.js';

const PAGE = 25;
let lb = null; // { slug, title, pot, entries } for the pager

function descHtml(text) {
  const body = esc(text || '').split(/\n\s*\n/).map((chunk) => {
    const line = chunk.trim();
    if (line.startsWith('## ')) return '<h3>' + esc(line.slice(3).trim()) + '</h3>';
    if (line.startsWith('# ')) return '<h3>' + esc(line.slice(2).trim()) + '</h3>';
    return '<p>' + line.replace(/\n/g, '<br>') + '</p>';
  }).join('');
  return '<div class="desc">' + body + '</div>';
}

export function bountyView(b) {
  const l = left(b.deadline);
  const live = open(b.deadline);
  const rows = (b.rewardsNow || []).map((r) => '<tr><td>' + (r.place === 1 ? '1st' : r.place === 2 ? '2nd' : r.place === 3 ? '3rd' : r.place + 'th') + '</td><td class="num"><b>' + usd(r.amountUsd) + '</b></td><td class="num mut">' + usd(r.baseUsd) + ' + ' + usd(r.feeShareUsd) + ' fees</td></tr>').join('');
  return '<p class="small"><a href="#/">← All bounties</a> · <a href="#/bounty/' + encodeURIComponent(b.slug) + '/leaderboard">Leaderboard →</a></p>' +
    '<h1>' + esc(b.title) + '</h1>' +
    '<div class="meta"><span class="pot">' + usd(b.potUsd ?? b.rewardAmount) + '</span><span class="big mut">live pot</span>' +
    (b.entryFeeUsd ? '<span class="big"><b>' + usd(b.entryFeeUsd) + '</b> entry fee</span>' : '<span class="big">Free entry</span>') +
    '<span class="big"><span class="left ' + l.cls + '" data-deadline="' + esc(b.deadline) + '">' + l.text + '</span></span>' +
    '<span class="big"><b>' + num(b.submissionCount) + '</b> entries</span></div>' +
    '<p class="mut">' + (live ? 'Open — still taking entries' : 'Closed to entries — deadline passed') + ' · ' + esc(b.category || '') + ' · sponsored by ' + esc(b.sponsor && b.sponsor.name ? b.sponsor.name : 'make.fun') + '</p>' +
    (b.summary ? '<p class="big">' + esc(b.summary) + '</p>' : '') +
    '<h2>Rewards</h2><table><thead><tr><th>Place</th><th class="num">Pays now</th><th class="num">Prize + fee share</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '<p class="small mut">Places 1–' + (b.rewardsNow || []).length + ' share ' + usd(b.rewardAmount) + ' plus entry fees; the table shows the live amounts.</p>' +
    '<h2>Dates</h2><p>Published ' + when(b.publishedAt) + '<br>Entries close ' + when(b.deadline) + ' (' + l.text + ')<br>Status: ' + esc(b.status || '') + '</p>' +
    ((b.skills || []).length ? '<h2>Skills</h2><p>' + b.skills.map((s) => '<span class="chip">' + esc(s) + '</span>').join('') + '</p>' : '') +
    '<h2>Rules &amp; description</h2>' + descHtml(b.description) +
    '<p><a href="#/bounty/' + encodeURIComponent(b.slug) + '/leaderboard">See the leaderboard →</a> · <a href="https://make.fun/bounty/' + encodeURIComponent(b.slug) + '" rel="noopener">Open on make.fun →</a></p>';
}

function lbRows(entries, page) {
  const slice = entries.slice(page * PAGE, page * PAGE + PAGE);
  return slice.map((e) => {
    const rate = e.values ? pct(e.values.judge) : '—';
    const bytes = e.values && e.values.bytes ? num(e.values.bytes) + ' B' : '—';
    const img = e.image ? '<img class="av-sm" loading="lazy" crossorigin="anonymous" alt="" src="https://make.fun' + esc(e.image) + '">' : '';
    return '<tr><td><b>' + num(e.rank) + '</b></td><td>' + img + '<a href="#/u/' + encodeURIComponent(e.handle) + '">' + esc(e.handle) + '</a></td>' +
      '<td class="ttl">' + esc(e.title || '') + '</td><td class="num"><b>' + rate + '</b></td><td class="num mut">' + bytes + '</td></tr>';
  }).join('');
}

export function lbView(data, slug) {
  lb = { slug, title: data.competition ? data.competition.title : slug, entries: data.entries || [] };
  return lbPage(0);
}

export function lbPage(page) {
  const pages = Math.max(1, Math.ceil(lb.entries.length / PAGE));
  const p = Math.min(Math.max(0, page), pages - 1);
  return '<p class="small"><a href="#/bounty/' + encodeURIComponent(lb.slug) + '">← ' + esc(lb.title) + '</a></p>' +
    '<h1>Leaderboard</h1>' +
    '<p class="mut">' + esc(lb.title) + ' · ' + num(lb.entries.length) + ' ranked entries · win rate is the judge\u2019s share of wins, size breaks ties</p>' +
    '<table><thead><tr><th>#</th><th>Entrant</th><th>Entry</th><th class="num">Win rate</th><th class="num">Size</th></tr></thead><tbody>' + lbRows(lb.entries, p) + '</tbody></table>' +
    '<div class="pager"><button data-page="' + (p - 1) + '"' + (p === 0 ? ' disabled' : '') + '>← Prev</button>' +
    '<span>Page ' + (p + 1) + ' of ' + pages + '</span>' +
    '<button data-page="' + (p + 1) + '"' + (p >= pages - 1 ? ' disabled' : '') + '>Next →</button></div>' +
    '<p class="small mut">One request fetched the whole leaderboard; paging is instant and costs nothing more.</p>';
}

export function profileView(p) {
  const r = p.record || {};
  const rows = (p.solutions || []).map((s) => {
    const c = s.competition || {};
    return '<tr><td><a href="#/bounty/' + encodeURIComponent(c.slug || '') + '">' + esc(c.title || c.slug || '') + '</a></td>' +
      '<td>' + esc(s.title || '') + '</td><td class="num">' + (s.score ? pct(s.score.value) : '—') + '</td>' +
      '<td class="num">' + (s.placement ? num(s.placement) : '—') + '</td></tr>';
  }).join('');
  return '<p class="small"><a href="#/">← All bounties</a></p>' +
    '<div class="prow">' + (p.image ? '<img class="avatar" crossorigin="anonymous" alt="" src="' + esc(p.image) + '">' : '') +
    '<div><h1 style="margin:0">' + esc(p.display_name || p.handle) + '</h1><p class="mut" style="margin:.1em 0">@' + esc(p.handle) +
    (p.github_login ? ' · GitHub ' + esc(p.github_login) : '') + '<br>Joined ' + when(p.joined_at) + '</p></div></div>' +
    (p.bio ? '<p class="big">' + esc(p.bio) + '</p>' : '') +
    '<div class="totals"><div><b>' + num(r.competitions_entered) + '</b><span>entered</span></div>' +
    '<div><b>' + num(r.competitions_placed) + '</b><span>placed</span></div>' +
    '<div><b>' + num(r.competitions_won) + '</b><span>won</span></div>' +
    '<div><b>' + usd(r.prize_usd) + '</b><span>prize money</span></div></div>' +
    '<h2>Entries</h2>' +
    (rows ? '<table><thead><tr><th>Bounty</th><th>Entry</th><th class="num">Score</th><th class="num">Place</th></tr></thead><tbody>' + rows + '</tbody></table>' : '<p class="mut">No entries yet.</p>');
}
