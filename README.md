# makefun-frontend

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/auracreation/makefun-frontend/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/auracreation/makefun-frontend/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A fast, read-only make.fun frontend in plain static files: a live bounty board with pots, entry fees and countdowns beside every bounty page, its leaderboard, and public account profiles. No build step, no sign-in, no writes — it reads the public make.fun API alone, caches answers with ETags, and keeps the first load under two kilobytes gzipped.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the board is at `#/`, a bounty at `#/bounty/<slug>`, its leaderboard at `#/bounty/<slug>/leaderboard`, and a profile at `#/u/<handle>`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=alpaca&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>
