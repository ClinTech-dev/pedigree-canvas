# Synthesis protocol

Version: **1** (2026-11-05). Turns a round's interviews and usability notes into
three outputs, saved to `runs/<round>/synthesis.md`.

## 1. Fix list (from usability)

Merge stuck points and answer-key failures across personas. One row per distinct
problem, ranked by severity, then by how many personas hit it.

| # | Problem | Personas | Severity | Evidence (file and step) | Suggested fix | Issue |
|---|---|---|---|---|---|---|

- **Blocker:** persona could not finish the main task.
- **Major:** finished, but with a wrong symbol, a stuck point, or an export that
  wouldn't work for their workflow.
- **Minor:** slowed them down or confused them.

A Bennett/NSGC error is at least Major, whoever found it. Check it against
`docs/bennett-pedigree-standards.md` before filing.

File each Major or Blocker as a GitHub issue labelled `persona-test` and link it.

## 2. Hypothesis table (from interviews)

| Hypothesis | Y | N | ? | What the personas suggest | What only humans can confirm |
|---|---|---|---|---|---|

Remember these are synthetic: a column of Y means "the desk research is
internally consistent", not "this is true". The useful output is the last column.

## 3. Sharpened interview guide

- Every question flagged "weak" by two or more personas: propose a rewrite.
- Every UNSURE answer: is it a question only a human can answer? If yes, keep it
  and move it earlier; if the desk research could answer it, add a research task.
- Drop or shorten questions the personas answered identically from the evidence;
  they're likely to give little new from humans either.
- Add any question the usability tests raised (for example "what would you need
  to see to trust this symbol?").

Update the guide doc, and record the change in the next round's `meta.md`.

## 4. Round-over-round comparison (from round 2 on)

| Metric | Last round | This round | Change |
|---|---|---|---|
| Personas completing the main task | | | |
| Mean estimated human time | | | |
| Total stuck points | | | |
| Answer-key ✓ rate | | | |

Note which fixes shipped between rounds and whether the stuck points they targeted
went away.
