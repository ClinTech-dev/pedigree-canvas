# Round 2026-11-05-r1 · synthesis · SYNTHETIC

Usability only. Interviews are on hold until a genetic counsellor has reviewed the
personas; sections 2 and 3 will be filled in then.

## Headline

All eight personas finished the scripted family, and none scored a symbol
outright wrong against the answer key except one indistinguishable legend (P5).
The app is roughly **as fast as paper, not faster**: estimated human time was
3.7 to 6.0 minutes for the main task against an assumed 3 to 4 minute paper
baseline. Structure is quick (adding both parents in one click, automatic
layout); annotation is slow, because each cancer is entered twice (as a
condition and again as a note for age at diagnosis).

The problems that matter most are in what a reader sees afterwards: the genetic
test result, cause and age at death, and the export.

| Persona | Completed | Est. time (budget) | Stuck points | Answer key ✓ / ~ / ✗ |
|---|---|---|---|---|
| P1 Priya, private telehealth | Yes; CanRisk extension blocked | 3.8 min (15) | 2 | 15 / 2 / 0 |
| P2 Tom, student | Yes | 4.4 min (20) | 3 | 15 / 2 / 0 |
| P3 Helen, hospital, shared PC | Yes | 3.9 min (10) | 0 | 14 / 3 / 0 |
| P4 Margaret, convenor | Yes | 6.0 min (30) | 2 | 16 / 2 / 0 |
| P5 Jess, breast care nurse | Yes | 3.7 min (5) | 0 | 12 / 4 / 1 |
| P6 Daniel, paper-first | Yes; photo import blocked | 4.2 min (10) | 1 | 14 / 3 / 0 |
| P7 Sofia, IVF clinic | Yes, incl. pregnancy losses | 4.0 min (15) | 0 | 14 / 4 / 0 |
| P8 Raj, geneticist | Yes, incl. consanguinity | 3.8 min (10) | 1 | 14 / 3 / 0 |

Times are keystroke-level estimates from the agents' action counts, without
listening or thinking-aloud time, so treat them as lower bounds.

## 1. Fix list

| # | Problem | Personas | Severity | Suggested fix |
|---|---|---|---|---|
| 1 | Genetic test result shows only the gene ("BRCA2") on the symbol; the result ("VUS") is only in the key, so a scan reads as a positive carrier | All 8 | Major (clinical misread) | Draw "BRCA2 VUS" (gene + result) under the symbol, on canvas and in every export |
| 2 | "Died in her 60s" can't be entered: Age is numbers-only and "60s" silently becomes "d. 60". Cause of death is saved but never drawn | All 8 | Major | Accept approximate ages ("60s", "~65", "?"); draw cause of death under the symbol |
| 3 | PDF export is one raster image (about 20 MB), drops the I–IV generation numerals, prints a US date (11/5/2026), defaults to "Untitled Pedigree". PNG also drops numerals and has a transparent background | P1–P8 (all who exported) | Major | Vector PDF; include generation numerals in every export; locale date; prompt for title; white PNG background |
| 4 | Unknown-zygosity twins are hard to make: the add popup offers MZ/DZ only; "Unknown" is only in the panel after twins exist; existing siblings can't be turned into twins (⌘K "twin" finds nothing); Sibling → DZ creates two new children | P1, P2, P4, P5, P6, P7, P8 | Major (P8 recorded DZ for "not sure") | Add "Unknown (?)" to the popup; add a "Make twins" command reachable from ⌘K and right-click on two selected siblings |
| 5 | Birth order isn't kept: new siblings always go to the right, and Reformat put the son (11) left of the daughter (14) | P1, P2, P3, P4, P6, P7, P8 | Major (Bennett: oldest on the left) | Order siblings by age/DOB when known, in both add and Reformat |
| 6 | A second condition defaults to the same colour, quarter and pattern as the first, so breast and ovarian cancer look identical unless changed | P3, P5, P6 | Major (P5 failed S2) | Give each new legend entry the next free quarter and a distinct pattern |
| 7 | Lines of descent and sibship lines run through labels (Sarah's "BRCA2", the grandmother's note, the twin "?") | P2, P4, P6, P7, P8 | Minor to Major | Reserve label space in layout, or route lines around text |
| 8 | Shared clinic PC: reopening the tab silently restores the named family; no visible "close patient" or "clear"; no privacy statement to give IT | P3 | Major (H4, H6) | "Close and clear" action, optional no-autosave mode, a one-page data-flow statement linked from the app |
| 9 | `.ped` export has only IDs, sex and one affected flag (no ages, conditions, deceased, twins); no CanRisk export | P1, P3 | Major (feature gap; re-entry stays) | Richer export: CanRisk format first, then the formats Progeny/TrakGene import |
| 10 | Adding a second partner can place her exactly on top of an existing person; Reformat then merged two sibships into one interleaved line | P8 | Major (temporary misleading state) | Collision check on add; regression fixture for multi-partner + consanguinity in `src/utils/__fixtures__/pedigrees.ts` |
| 11 | Individual numbers (III-2) change on every relayout | P8 | Minor | Keep numbering stable or warn that it changed |
| 12 | No way to import a paper or photo pedigree | P6 | Blocker for that extension (known feature gap) | Already on the feature list (photo import) |
| 13 | No letterhead or logo in PDF export | P1, P7 | Minor (feature) | Branded PDF option (already on the feature list) |
| 14 | Smaller issues: new parents appear under the toolbar and Fit cuts off the key; Help shows Mac ⌘ shortcuts on Windows; wand button unlabelled (tooltip unconfirmed headless); Partner vs Sibling button confusion (P5); "New" wipes the only document; SAB triangle not smaller; SAAB shown as "AFAB" without parentheses | Various | Minor | Batch into one polish issue |

### Standards finding (fixed in this round)

The repo's standards doc said dizygotic twins drop from "separate points" on the
sibship line. Bennett 2022 Figure 3 shows all twins from a single point, with a bar
for MZ and "?" for unknown. The app was already right; the doc and the answer key
were corrected.

### What worked

- The core flow is learnable without help: every persona finished, including
  the 5-minute nurse.
- Proband arrow, deceased slash, legend, generations and partner lines were right
  for everyone.
- Pregnancy losses (SAB triangle, stillbirth as a sex symbol with slash and "SB")
  and consanguinity (double line via Alt-drag) drew to standard.
- The "layout looks tangled → Reformat" prompt fixed a crossing consanguinity line.

## 2. Hypothesis table

Pending interviews. Usability evidence so far, synthetic:

- **H1 (faster than paper):** not supported. Parity at best, because of
  double-entry annotation. Real paper times must come from humans.
- **H2 (PDF is enough):** at risk. A 20 MB raster PDF may exceed EHR attachment
  limits (P3), and it drops generation numerals.
- **H6 (shared PC):** confirmed as a product gap; whether it is a real
  problem depends on real hospital PCs.

## 3. Sharpened interview guide

Pending interviews. Questions the usability round adds for humans:

- "How do you write a test result on the pedigree today?" (fix 1)
- "How do you record an age you only know roughly?" (fix 2)
- "What's the largest file your record system accepts?" (fix 3)
- "When the family isn't sure about twins, what do you draw?" (fix 4)

## 4. Round-over-round comparison

First round; baseline is the table in the headline.
