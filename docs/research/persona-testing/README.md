# Persona testing framework

A repeatable "dress rehearsal" for user research. AI personas, each grounded in
the desk research, are interviewed with the real interview guide and then try the
live app with the guide's scripted family. The output is a fix list and a sharper
guide for the human interviews.

> **Personas are a dress rehearsal, not demand proof.** Every persona answer is
> synthetic. Use a round to find usability bugs, rehearse the questions and decide
> what only a real clinician can tell us. Never quote a persona as evidence that
> anyone wants the product.

## Inputs (the source of truth)

| Input | Where | Used for |
|---|---|---|
| Desk research | [Claude Doc](https://claude.ai/artifact/HcgwAkFxgCB2exrVKmz9jk), distilled into [`evidence.md`](evidence.md) | Grounding every persona trait (`E` ids) |
| Interview guide | [Claude Doc](https://claude.ai/artifact/KtSAaqBMXinSnu7dPCyxvW), mirrored in [`protocols/interview.md`](protocols/interview.md) | Questions, hypotheses H1 to H6 |
| Bennett/NSGC standard | [`../../bennett-pedigree-standards.md`](../../bennett-pedigree-standards.md) | Usability answer key |
| Live app | https://pedigree.clintech.com.au | Usability tests |

If the desk research or guide changes, update `evidence.md` or the protocol first,
then bump the version of any persona whose evidence moved.

## Personas

| Id | Who | Segment | Launch priority |
|---|---|---|---|
| [P1](personas/P1-private-telehealth-cancer-gc.md) | Priya, private cancer counsellor, mostly telehealth | Private / telehealth | Early adopter |
| [P2](personas/P2-gc-masters-student.md) | Tom, second-year GC master's student | Students / trainees | Early adopter |
| [P3](personas/P3-hospital-gc-progeny-shared-pc.md) | Helen, senior hospital counsellor, Progeny, shared PCs | Hospital | Bottom-up hospital |
| [P4](personas/P4-course-convenor.md) | Margaret, course convenor | Educators | Early adopter |
| [P5](personas/P5-breast-care-nurse.md) | Jess, breast care nurse | Specialist nurse | Later |
| [P6](personas/P6-hospital-gc-paper-first.md) | Daniel, regional hospital counsellor who draws on paper | Hospital | Bottom-up hospital |
| [P7](personas/P7-private-fertility-clinic-gc.md) | Sofia, private IVF clinic counsellor | Private / telehealth | Early adopter |
| [P8](personas/P8-clinical-geneticist-reviewer.md) | Raj, clinical geneticist (the sceptic) | Clinical geneticist | Later |

The mix follows the guide's recruitment weighting (private/telehealth 2, trainee 1,
educator 1, hospital 2, nurse 1) plus one sceptical reviewer to stress-test
complex layouts. New personas start from [`personas/TEMPLATE.md`](personas/TEMPLATE.md).

## Layout

```
persona-testing/
  README.md            this file: the method and how to run a round
  evidence.md          numbered evidence register (E1..En) from the desk research
  personas/            one card per persona (P1..Pn), versioned, evidence-linked
  protocols/
    interview.md       the interview, run once per persona in a fresh context
    usability.md       the live-app task, answer key and scoring
    synthesis.md       how to turn a round into a fix list and a sharper guide
  runs/
    YYYY-MM-DD-rN/     one folder per round (see "Run folder" below)
```

## Running a round

1. **Freeze the inputs.** Create `runs/<date>-r<N>/meta.md` from the template in
   [`runs/TEMPLATE-meta.md`](runs/TEMPLATE-meta.md): persona versions, evidence
   version, app URL, deployed commit, and whether the UI changed since last round
   (for example the ClinTech rebrand).
2. **Check the personas.** Re-read each card against `evidence.md`. Anything a
   counsellor has corrected since last round goes in first, with the persona's
   version bumped and a changelog line.
3. **Interviews.** For each persona, run [`protocols/interview.md`](protocols/interview.md)
   in a *fresh context* (a separate agent per persona) so answers do not bleed
   between personas. Save to `runs/<round>/interviews/<P-id>.md`.
4. **Usability.** For each persona, run [`protocols/usability.md`](protocols/usability.md)
   against the live app in a real browser. Save notes and screenshots to
   `runs/<round>/usability/<P-id>.md` and `.../screenshots/`.
5. **Synthesis.** Follow [`protocols/synthesis.md`](protocols/synthesis.md) to
   write `runs/<round>/synthesis.md`: the fix list (with issue links once filed),
   the hypothesis table, and the "humans only" question list.
6. **Close the loop.** File fix-list items as GitHub issues labelled
   `persona-test`, update the interview guide with the sharpened questions, and
   note in the next round's `meta.md` which fixes shipped so the round can check
   them.

## Rules that keep it honest

- **Every persona claim is tagged.** `[E7]` means it comes from the evidence
  register; `[A]` means it is an assumption we made up to make the persona
  concrete. A counsellor review should target the `[A]` tags first.
- **Personas may say "I don't know".** If the evidence and the card don't cover a
  question, the persona says so instead of inventing an answer. Those gaps are
  exactly what the human interviews are for.
- **No product knowledge before the usability task.** Interview agents are not
  shown the app or the codebase.
- **Usability agents behave like the persona,** not like an engineer: no reading
  the source, no dev tools, no URL tricks. They only use what's on screen and the
  in-app help, within the persona's patience budget.
- **AI timings are not human timings.** Report actions and stuck points, and an
  estimated human time from the action count (see the usability protocol), never
  the agent's wall-clock time as if a person took it.
- **Same personas across rounds.** Change a persona only to correct it, never to
  get a different answer. Comparing rounds is the point.
