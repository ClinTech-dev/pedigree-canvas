# Round 2026-11-05-r1 · meta

| Field | Value |
|---|---|
| Date | 2026-11-05 |
| Run by | Claude (one agent per persona), for Josh |
| Evidence register version | 1 |
| Protocol versions | interview v1 (not yet run), usability v1, synthesis v1 |
| Personas and versions | P1–P8, all v1 |
| Personas reviewed by a human since last round | None yet; sent for genetic-counsellor review ([review doc](https://claude.ai/artifact/QnEGivfHyqQnnoxpaDPTmC)) |
| Target | Local production build (`vite preview`) of `main` at `e1cb248`. The live site was blocked by the cloud environment's network policy. |
| Deployed commit at test time | Not checked; assumed to be `main` |
| UI changes since last round | First round. A ClinTech rebrand is in progress in another thread; this round used the pre-rebrand UI. |
| Fixes shipped since last round | n/a |
| Deviations from protocol | P1 (the pilot) saw the answer key before drawing; the key was then moved to its own file for P2–P8. Interviews deferred until the persona review comes back. Edge personas (P3, P6) ran in Chromium. Native dropdowns were set programmatically; headless screenshots don't show hover tooltips, so "no tooltip" findings are unconfirmed. |
