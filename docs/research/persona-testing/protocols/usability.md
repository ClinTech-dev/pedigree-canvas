# Usability protocol

Version: **1** (2026-11-05). Mirrors the 15-minute usability task of the
[interview guide](https://claude.ai/artifact/KtSAaqBMXinSnu7dPCyxvW) and tests H1 and H8
plus Bennett/NSGC correctness.

## Target

- **Preferred:** the live app, https://pedigree.clintech.com.au, so the round
  tests what users actually get.
- **Fallback:** a production build of the deployed commit (`npm ci && npm run
  build && npx vite preview`). Record which one you used, and the commit, in
  `meta.md`. If the UI is mid-rebrand, note which screens look different.

Use a real browser (Playwright Chromium is fine) at the persona's screen size,
in a fresh profile with empty storage. The app keeps its document in browser
storage, so drive one long-lived browser session (for example a script that
waits for step files) rather than relaunching the browser between steps.

## Persona behaviour rules

The agent plays the persona, not a tester:

- Only use what's on screen and the app's own help. No source code, no dev tools,
  no URL tricks, no reading the repo's docs.
- Respect the persona's habits from the card (mouse-only, never reads help, etc.)
  and its **patience budget**. Count actions; when the budget runs out (see
  "Estimated human time"), the persona gives up and you record where.
- Think aloud in the persona's voice at each stuck point: what they expected, what
  they tried.
- A **stuck point** is three failed attempts at the same sub-goal, or having to
  open help to continue.

## The scripted family (all personas)

Read to the persona as one block, as at consult pace:

> The patient, Sarah, is 42 and was diagnosed with breast cancer at 39. She has a
> brother, 45, who is well. Their mother had ovarian cancer at 52 and died at 58.
> Their father is 70 and well. Mum had two sisters: one had breast cancer at 48,
> the other is well. Mum's mother died of "stomach trouble" in her 60s. Sarah has a
> daughter, 14, and a son, 11, with her husband. Sarah's brother and his wife have
> twin girls, 8; she's not sure if they're identical. Sarah had a BRCA2 test last
> month; the result was a variant of uncertain significance.

Then: "Draw this family, and when you're done, save or export it the way you
would for your work."

## Answer key

The answer key is in [`answer-key.md`](answer-key.md). Agents running a test must not open it until they have finished drawing and exporting.

## Persona-specific extension (after the main task, if budget remains)

| Persona | Extra task | Why |
|---|---|---|
| P1 | Find a way to get this family into CanRisk; produce a PDF for a referral letter | E23, E27 |
| P2 | Export an image for a slide; check it at full size | E8 |
| P3 | Find out where the data is stored; close the tab, reopen, and see what remains | H5 |
| P4 | Export SVG or PDF; check every symbol in the legend and on canvas | E8 |
| P5 | Main task only, with a 5-minute budget | E6 |
| P6 | Compare against pen speed; look for anything that imports a paper drawing | H1, H10 |
| P7 | Add a miscarriage at 10 weeks and a stillbirth at 30 weeks to Sarah's partnership | Pregnancy notation |
| P8 | Make Sarah's daughter's future partner a first cousin (consanguinity); add a half-sibling | E7 |

## Estimated human time

Agent wall-clock time is not a human time. Estimate with keystroke-level model
operators, counted from the actions the agent took:

| Operator | Seconds |
|---|---|
| Point with mouse (P) | 1.1 |
| Click (B) | 0.2 |
| Keystroke (K), average typist | 0.28 per key |
| Move hand mouse to keyboard (H) | 0.4 |
| Mental preparation (M), once per new sub-goal | 1.35 |

Add 10 seconds per stuck point for reading or re-trying. Report the total as
"estimated minutes" and compare it to the persona's patience budget. As a rough
paper baseline, assume a skilled counsellor draws this family on paper in about
3 to 4 minutes [A]; real paper times come from the human interviews.

## Output template

Save to `runs/<round>/usability/<P-id>.md`, screenshots to
`runs/<round>/usability/screenshots/<P-id>-<n>.png`.

```markdown
# <P-id> usability · round <round> · SYNTHETIC

Persona: <P-id> v<version> · Protocol: usability v1 · Target: <url or commit> · Viewport: <w x h>

## Outcome
Completed: yes / partly / gave up at <step>
Estimated human time: <min> (budget <min>) · Actions: <n> · Stuck points: <n>
Export: <format, opened OK?>

## Walkthrough
1. <what the persona tried> → <what happened> (screenshot)
...

## Stuck points
| # | Sub-goal | What they expected | What happened | Severity (blocker / major / minor) |

## Answer-key score
| Key | Result | Note |
(K1..K14, S1..S4)

## Bennett/NSGC issues seen
## Persona's verdict (in voice, 2–3 sentences)
## Extension task notes
```
