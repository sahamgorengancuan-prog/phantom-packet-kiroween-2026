# PHANTOM PACKET — Offline Bulletin Board Revival

A new **Kiroween 2026 / Resurrection** entry built with Kiro CLI. A browser-only reinterpretation of classic BBS/FidoNet store-and-forward discussion packets, with a haunted-terminal visual identity, five rooms, local posts/replies, sample fictional messages, and integrity-checked packet import/export. **No user account, external API, server-side storage or real emergency dispatch.**

## Run and test

Requires Python 3 (static host), Node 22 (tests), and a current Chromium/Firefox/Safari browser.

```bash
python3 -m http.server 19187 --bind 127.0.0.1 --directory public
# browse http://127.0.0.1:19187/
npm test
```

To install the PWA, use a secure HTTPS host (or local `localhost`), load the site online once, then test with browser networking disabled. Wait for the service worker to install before disconnecting. The browser verification in OFFLINE_BROWSER_VERIFICATION_20261120.json recorded an offline reload, a locally created post persisting across an offline reload, and a successful reconnect. There is no server-side messaging or real-time synchronization: packet export/import is a manual offline transport, like a classic BBS mail packet.

## Features

- Responsive retro BBS interface with five local-only rooms; compose a message, post a reply, mark urgency in the emergency room, clear all local data
- Fictional seeded messages clearly labeled as demo; no production outage information
- Versioned JSON packet export/import; SHA-256 digest covers packet data and detects accidental corruption; strict 500 KB cap, schema/ID/room/timestamp validation, exact-ID deduplication and inert plain-text rendering
- Service worker caches app shell and scripts within the app's own URL scope; localStorage holds user-created messages locally
- Self-contained vanilla JS/HTML/CSS, no npm dependencies, accessible labels and mobile layout

## Verification and safety boundaries

Run `npm test` for baseline and robustness checks. SHA-256 **is not a signature** and does not establish packet author identity: a malicious sender can compute a new digest. Do not share private data, upload real alerts, or rely on this prototype for emergency communications. Manually imported packets replace the local board. PWA offline use requires an initial successful online install.

## How Kiro was used (real provenance)

The new application was commissioned on **20 November 2026** via authenticated **Kiro CLI 3.5.0** under the entrant’s AWS Builder ID. Kiro generated the initial source modules, UI stylesheet/HTML, service worker, package scripts and unit tests via its Write File / Replace in File tools. The first low-cost model had tool-permission failures; the subsequent Kiro session used Claude Haiku 4.5 to produce the working app and test suite in this workspace. After Kiro, the maintainer audited and fixed missing form selectors, relative PWA assets, service-worker registration and packet validation; then added dedicated negative tests and `.kiro` specification documents. **Do not claim that Kiro autonomously implemented every final line, nor claim this code is derived from the pre-existing CereX project.** No external code was imported.

## Files

- `public/index.html` — responsive terminal UI
- `public/src/*.mjs` — deployable ES modules, mirrored from `src/`
- `src/*.mjs` — tested local store, packet validation, sample data, rendering, app actions
- `public/service-worker.js`, `public/manifest.json`, `public/icons` — installable PWA assets
- `test/*.test.mjs` — Node 22 tests
- `.kiro/steering/product.md`, `.kiro/specs/phantom-packet/` — specifications, acceptance criteria and Kiro build history

## Kiroween submission status

Category: **Resurrection**. Built during the permitted period (after October 30, 2026). Functional app and tests are real. The [public demo video](https://youtu.be/3hoidBZUu6s) is 108 seconds. The public GitHub repository and final Devpost submission are pending. Rules require a public MIT-licensed GitHub repository including root `.kiro`, and a public demo video below 3 minutes showing this working application. See `SUBMISSION_CHECKLIST.md`.

MIT-licensed. This contest entry and its spooky content are not affiliated with the organizers of Kiroween, FidoNet, or any emergency service.
