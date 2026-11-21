# Design — PHANTOM PACKET

**Platform:** static HTML/CSS/ES Modules with Node 22 built-in tests; no npm dependencies.

**Modules:** `src/store.mjs` manages a versioned localStorage board; `src/packet.mjs` is an isolated SHA-256/JSON export-import boundary; `src/demo.mjs` creates clearly fictional fixtures; `src/ui.mjs` provides DOM helpers; `src/app.mjs` attaches browser handlers and displays untrusted text via `textContent`; `public/` mirrors deployable source under one service-worker scope.

**Trust boundary:** User-chosen JSON bytes enter `importPacket`; a size cap runs *before* parse. Check schema, hash, room and message IDs, timestamps, text lengths and counts before changing localStorage. The digest is not a signature. A malicious party may author another internally consistent packet. Explicit confirmation precedes overwriting/clearing local board.

**PWA:** relative `./` assets and service worker cache under the served app base path; icons are locally authored PNG, no remote fonts, data or libraries. A 404 during cache population is a test failure.

**Design language:** spooky phosphor-green terminal with neon accents, prominent demo-only note and responsive sidebar. Fictional system alerts are not real notices.

**Acceptance:** run Node tests and Chrome interaction: load demo, create post, reply, export, import, reload persistence, offline refresh. Only mark project deployed after real web HTTP 200 and browser checks.
