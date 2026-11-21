# Requirements — Resurrection of store-and-forward BBS

R1. On a current mobile or desktop browser, render five fictional offline message rooms, messages, author/subject/text form, replies and clear-local-data action.

R2. All data persists in localStorage until cleared. No external API or server-side message storage; one user's board is not synchronized with another user's board.

R3. Export a versioned JSON packet with a SHA-256 checksum. Import rejects non-JSON, checksum mismatches, more than 500 KB, invalid room/message IDs, invalid timestamp, overlong text and unknown room references. Exact duplicate message IDs are deduplicated.

R4. Untrusted content is displayed with `textContent` only, never with message `innerHTML`.

R5. Page works in HTTPS and offline after the first online load. PWA service worker must cache only same-app files and remain scoped to application subpath.

R6. Demo content must be clearly fictional; describe SHA-256 as corruption detection, not identity authentication.

R7. Node 22 tests cover primary CRUD and packet failure boundaries; test count must not be represented as actual user acceptance until browser UAT is performed.

R8. Public source must have MIT LICENSE, README, root `.kiro`, public demo and published submission receipt before counting 100% for Kiroween.
