// Entry program for makefun-frontend-01 (Node 22, standard library only).
//
// The entry itself is the static frontend in app/ beside this file: plain
// HTML, ES modules and CSS with no build step, reading the make.fun public
// API. This program hands it in by copying app/ and screenshots/ into the
// grader's output directory and writing dossier.json there, using the
// vendored make.fun dossier library. The scorer rebuilds the dossier with
// its own copy of that library, so vendor/makefun-frontend.ts must stay
// byte for byte as the kit shipped it.
//
// Run locally with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps mirror the gate: at most 3 screenshots of 256 KiB, app/ at most
// 993 files and 16 MiB, dossier text at most 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 3, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
