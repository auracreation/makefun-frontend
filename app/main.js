// Router and shell: the board list is fetched once and kept beside every
// detail view, so moving between board, bounty, leaderboard and profile
// never refetches it. Detail code loads only when its route is visited.
//
//   #/                              the board + overview
//   #/bounty/<slug>                board + bounty page
//   #/bounty/<slug>/leaderboard    board + leaderboard
//   #/u/<handle>                   board + public profile
//
// window.__shotReady is false while a route loads and true once its data
// has rendered, so a screenshot script knows when to capture.
import { board, bounty, list, profile } from './api.js';
import { boardHtml, filterItems, overviewHtml, row, sortItems } from './board.js';
import { left } from './fmt.js';

const boardEl = document.getElementById('board');
const viewEl = document.getElementById('view');
let items = null;
let state = { q: '', sort: 'pot', show: 'all' };
let current = null;
let lastPainted = null;
let detail = null; // the lazily loaded detail module

async function loadDetail() {
  if (!detail) detail = await import('./detail.js');
  return detail;
}

function paintBoard() {
  if (!items) return;
  boardEl.innerHTML = boardHtml(items, state, current);
  const q = document.getElementById('q');
  if (q && document.activeElement !== q) q.value = state.q;
}

function paintRowsOnly() {
  const rows = document.getElementById('rows');
  if (!rows || !items) return;
  const shown = sortItems(filterItems(items, state), state.sort);
  rows.innerHTML = shown.map((b) => row(b, current)).join('') || '<p class="mut">No bounties match.</p>';
}

function fail(el, err) {
  el.innerHTML = '<div class="err"><b>Could not load this view.</b><p class="small">' + String(err && err.message ? err.message : err) + '</p><p><a href="#/">Back to the board</a></p></div>';
}

async function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  const mLb = hash.match(/^#\/bounty\/([^/]+)\/leaderboard\/?$/);
  const mB = hash.match(/^#\/bounty\/([^/]+)\/?$/);
  const mU = hash.match(/^#\/u\/([^/]+)\/?$/);
  const slug = (mLb || mB) ? decodeURIComponent((mLb || mB)[1]) : null;
  const handle = mU ? decodeURIComponent(mU[1]) : null;
  current = slug;
  document.body.dataset.route = slug || handle ? 'detail' : 'board';
  try {
    const fresh = !items;
    if (!items) items = (await list()).items || [];
    // Repaint the board only when it is new or the highlighted bounty
    // changed; otherwise the visitor's search text and focus survive.
    if (fresh || current !== lastPainted) { paintBoard(); lastPainted = current; }
    if (mLb) {
      const d = await loadDetail();
      const data = await board(slug);
      document.title = 'Leaderboard · ' + (data.competition ? data.competition.title : slug) + ' | make.fun board';
      viewEl.innerHTML = d.lbView(data, slug);
    } else if (mB) {
      const d = await loadDetail();
      const b = await bounty(slug);
      document.title = b.title + ' | make.fun board';
      viewEl.innerHTML = d.bountyView(b);
    } else if (mU) {
      const d = await loadDetail();
      const p = await profile(handle);
      document.title = '@' + p.handle + ' | make.fun board';
      viewEl.innerHTML = d.profileView(p);
    } else {
      document.title = 'make.fun board — live bounties, pots and leaderboards';
      viewEl.innerHTML = overviewHtml(items);
    }
  } catch (err) {
    fail(mLb || mB || mU ? viewEl : boardEl, err);
    if (!items) boardEl.innerHTML = '<div class="err"><b>Could not load the board.</b><p class="small">' + String(err && err.message ? err.message : err) + '</p></div>';
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// Board controls: search and sort re-render only the rows; the filter
// pills re-render the rows too. The detail pane is never touched.
boardEl.addEventListener('input', (ev) => {
  if (ev.target.id === 'q') { state.q = ev.target.value; paintRowsOnly(); }
});
boardEl.addEventListener('change', (ev) => {
  if (ev.target.id === 'sort') { state.sort = ev.target.value; paintRowsOnly(); }
});
boardEl.addEventListener('click', (ev) => {
  const pill = ev.target.closest('[data-show]');
  if (pill) { state.show = pill.dataset.show; paintBoard(); }
});

// Leaderboard pager buttons live in the detail pane.
viewEl.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('[data-page]');
  if (!btn || btn.disabled) return;
  const d = await loadDetail();
  viewEl.innerHTML = d.lbPage(Number(btn.dataset.page));
});

// Countdowns tick every 30 seconds without rebuilding any view.
setInterval(() => {
  document.querySelectorAll('[data-deadline]').forEach((el) => {
    const l = left(el.dataset.deadline);
    el.textContent = l.text;
    el.className = 'left ' + l.cls;
  });
}, 30000);

window.addEventListener('hashchange', render);
render();
