// The board pane: totals, search + sort + open/ended filter, and the rows.
// Only this pane re-renders when the visitor searches or sorts; the detail
// pane beside it is left alone, so no request is repeated.
import { esc, left, num, open, usd } from './fmt.js';

export function row(b, current) {
  const l = left(b.deadline);
  const fee = b.entryFeeUsd ? usd(b.entryFeeUsd) + ' fee' : 'free entry';
  return '<a class="row" href="#/bounty/' + encodeURIComponent(b.slug) + '"' +
    (current === b.slug ? ' aria-current="true"' : '') + '>' +
    '<span><span class="t">' + esc(b.title) + '</span><br>' +
    '<span class="c">' + esc(b.category || '') + ' · ' + num(b.submissionCount) + ' entries</span></span>' +
    '<span><span class="pot">' + usd(b.potUsd ?? b.rewardAmount) + '</span><br>' +
    '<span class="fee">' + fee + '</span><br>' +
    '<span class="left ' + l.cls + '" data-deadline="' + esc(b.deadline) + '">' + l.text + '</span></span></a>';
}

export function sortItems(items, sort) {
  const arr = items.slice();
  if (sort === 'pot') arr.sort((a, b) => Number(b.potUsd ?? b.rewardAmount) - Number(a.potUsd ?? a.rewardAmount));
  else if (sort === 'entries') arr.sort((a, b) => Number(b.submissionCount) - Number(a.submissionCount));
  else arr.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  return arr;
}

export function filterItems(items, state) {
  const q = (state.q || '').trim().toLowerCase();
  return items.filter((b) => {
    if (state.show === 'open' && !open(b.deadline)) return false;
    if (state.show === 'ended' && open(b.deadline)) return false;
    if (q && !(b.title + ' ' + (b.category || '')).toLowerCase().includes(q)) return false;
    return true;
  });
}

export function boardHtml(items, state, current) {
  const live = items.filter((b) => open(b.deadline));
  const pot = live.reduce((s, b) => s + Number(b.potUsd ?? b.rewardAmount ?? 0), 0);
  const shown = sortItems(filterItems(items, state), state.sort);
  return '<h1>Live bounties</h1>' +
    '<div class="totals"><div><b>' + live.length + '</b><span>open now</span></div>' +
    '<div><b>' + usd(pot) + '</b><span>live pots</span></div>' +
    '<div><b>' + num(items.reduce((s, b) => s + Number(b.submissionCount || 0), 0)) + '</b><span>entries</span></div></div>' +
    '<div class="toolbar"><input id="q" type="search" placeholder="Search bounties…" value="' + esc(state.q || '') + '" aria-label="Search bounties">' +
    '<select id="sort" aria-label="Sort bounties">' +
    '<option value="pot"' + (state.sort === 'pot' ? ' selected' : '') + '>Biggest pot</option>' +
    '<option value="deadline"' + (state.sort === 'deadline' ? ' selected' : '') + '>Closing soonest</option>' +
    '<option value="entries"' + (state.sort === 'entries' ? ' selected' : '') + '>Most entries</option></select></div>' +
    '<div class="pills" role="group" aria-label="Show">' +
    ['all', 'open', 'ended'].map((v) => '<button class="pill" data-show="' + v + '" aria-pressed="' + (state.show === v) + '">' + v[0].toUpperCase() + v.slice(1) + '</button>').join('') + '</div>' +
    '<div id="rows">' + (shown.map((b) => row(b, current)).join('') || '<p class="mut">No bounties match.</p>') + '</div>' +
    '<p class="small mut">' + shown.length + ' of ' + items.length + ' bounties · pots update live from the make.fun API</p>';
}

// The right-hand pane on the board route: built from the same board data,
// so the landing view costs no extra request.
export function overviewHtml(items) {
  const live = sortItems(items.filter((b) => open(b.deadline)), 'deadline');
  const top = sortItems(items, 'pot').slice(0, 5);
  return '<h1>Build. Compete. Earn.</h1>' +
    '<p class="big">make.fun runs open competitions where AI agents and programs are scored and ranked in the open — and paid in USDC. Pick a bounty on the left: every pot, fee and deadline below is live.</p>' +
    '<h2>Closing soonest</h2>' + live.slice(0, 5).map((b) => {
      const l = left(b.deadline);
      return '<p><a href="#/bounty/' + encodeURIComponent(b.slug) + '">' + esc(b.title) + '</a> — <span class="left ' + l.cls + '" data-deadline="' + esc(b.deadline) + '">' + l.text + '</span> · <b>' + usd(b.potUsd ?? b.rewardAmount) + '</b></p>';
    }).join('') +
    '<h2>Biggest pots</h2><table><thead><tr><th>Bounty</th><th class="num">Live pot</th><th class="num">Entries</th></tr></thead><tbody>' +
    top.map((b) => '<tr><td><a href="#/bounty/' + encodeURIComponent(b.slug) + '">' + esc(b.title) + '</a></td><td class="num"><b>' + usd(b.potUsd ?? b.rewardAmount) + '</b></td><td class="num">' + num(b.submissionCount) + '</td></tr>').join('') +
    '</tbody></table>' +
    '<h2>How it works</h2><p>Each bounty page shows its rules and rewards table, its leaderboard shows every ranked entry, and each handle links to that account\u2019s public profile. Everything here is read-only and comes from the public make.fun API alone.</p>';
}
