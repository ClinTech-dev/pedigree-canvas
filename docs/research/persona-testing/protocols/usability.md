# Usability protocol

Version: **1** (2026-11-05). Mirrors the 15-minute usability task of the
[interview guide](https://claude.ai/artifact/KtSAaqBMXinSnu7dPCyxvW) and tests H1
plus Bennett/NSGC correctness.

## Target

- **Preferred:** the live app, https://pedigree.clintech.com.au, so the round
  tests what users actually get.
- **Fallback:** a production build of the deployed commit (`npm ci && npm run
  build && npx vite preview`). Record which one you used, and the commit, in
  `meta.md`. If the UI is mid-rebrand, note which screens look different.

Use a real browser (Playwright Chromium is fine) at the persona's screen size,
in a fresh profile with empty storage.

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

## Answer key (Bennett/NSGC; see `docs/bennett-pedigree-standards.md`)

14 individuals over 4 generations. Score each row ✓ correct, ~ partly, ✗ wrong
or missing.

| # | Individual | Expected |
|---|---|---|
| K1 | Maternal grandmother (I) | Circle; deceased slash; "d. 60s"; cause "stomach trouble" noted as uncertain (e.g. "?" or note); not shaded as a known cancer |
| K2 | Maternal grandfather (I) | Square, unknown/unaffected; must exist so the mother's sibship has two parents |
| K3 | Mother (II) | Circle; shaded for ovarian cancer; deceased slash; "OvCa 52", "d. 58" |
| K4 | Father (II) | Square, unshaded, "70" |
| K5 | Maternal aunt 1 (II) | Circle; shaded for breast cancer; "BrCa 48" |
| K6 | Maternal aunt 2 (II) | Circle, unshaded |
| K7 | Sarah (III) | Circle; shaded breast cancer; **proband arrow** (P); age 42, "BrCa 39"; test result "BRCA2 VUS" |
| K8 | Brother (III) | Square, unshaded, 45; to Sarah's left or right by age order (older brother left) |
| K9 | Sarah's husband (III) | Square, partnership line to Sarah |
| K10 | Brother's wife (III) | Circle, partnership line to brother |
| K11 | Daughter (IV) | Circle, 14, under Sarah's partnership, older to the left |
| K12 | Son (IV) | Square, 11 |
| K13–14 | Twin girls (IV) | Two circles, age 8, from a **single point** on the sibship line, with **"?"** for unknown zygosity (not DZ separate points, not an MZ bar) |

Structure checks:
- S1 Generations top to bottom; partners on the same level; no crossing lines.
- S2 Legend present with two conditions (breast cancer, ovarian cancer), distinguishable.
- S3 Sarah is the proband (arrow); consultand marking optional.
- S4 Export produced (which format, and whether it opens and looks right).

## Persona-specific extension (after the main task, if budget remains)

| Persona | Extra task | Why |
|---|---|---|
| P1 | Find a way to get this family into CanRisk; produce a PDF for a referral letter | E23, E27 |
| P2 | Export an image for a slide; check it at full size | E8 |
| P3 | Find out where the data is stored; close the tab, reopen, and see what remains | H4, H6 |
| P4 | Export SVG or PDF; check every symbol in the legend and on canvas | E8 |
| P5 | Main task only, with a 5-minute budget | E6 |
| P6 | Compare against pen speed; look for anything that imports a paper drawing | H1, E31 |
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
