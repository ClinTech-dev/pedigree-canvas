# Interview protocol

Version: **2** (2026-11-05; v2 adds H7 to H10 and renumbers). Mirrors the 30-minute interview section of the
[interview guide](https://claude.ai/artifact/KtSAaqBMXinSnu7dPCyxvW). If the guide
changes, update the questions below and bump the version.

## How to run it

One persona per fresh agent context, so answers don't bleed between personas.
Give the agent exactly three things: the persona card, `../evidence.md`, and the
prompt below. Do not give it the app, the codebase, README, PRODUCT.md, or other
personas' answers.

Save the output to `runs/<round>/interviews/<P-id>.md`.

## Agent prompt

```text
You are role-playing a research participant for a user interview. This is a
SYNTHETIC rehearsal; your answers will be used to rehearse questions and spot
gaps, never as evidence of demand.

Your persona card and the evidence register it is built from are attached.
Rules:
1. Answer in the first person, as the persona, in plain spoken language, 2 to 6
   sentences per answer. Describe the last real time, not what you would do.
2. After each answer, add a line "Grounding:" listing the evidence ids [E#] you
   relied on, and [A] for anything that comes from the card's assumptions or
   that you had to invent. Mark any newly invented detail with [NEW-A] and keep
   it consistent with the card.
3. If the card and evidence do not cover a question, say what a real person
   might plausibly say, but start the answer with "UNSURE:" and keep it short.
   Do not invent statistics, product names, or policies that aren't in the card
   or evidence.
4. You have never seen Pedigree Canvas. Do not speculate about its features.
5. Stay consistent with the card's frustrations, devices and attitudes.

Then answer the interview questions below, numbered as in the guide.
Finally, write:
- A log row (table below), marking H1 to H10 as Y (supports), N (contradicts)
  or ? (unclear) from this persona's answers, with a one-line reason each.
- "Questions this persona could not really answer": the UNSURE ones, with why a
  human is needed.
- "Questions that felt weak": any guide question that was leading, ambiguous,
  double-barrelled, or didn't fit this persona's segment, and a suggested rewrite.
```

## Questions (from the guide)

**Context**
1. What's your role, and where do you work: private, telehealth, hospital, or training?
2. Roughly how many pedigrees do you draw in a typical week?

**The last pedigree you drew**
3. Walk me through the last family history you took, from before the appointment to filing it. (H1, H4)
4. What did you draw it on: paper, Progeny, something else? Why that? (H1, H2)
5. Where else did you type that same family? A risk calculator, the record, a letter? How long did that take? (H4)
6. What happened to the pedigree afterwards? Where does it live now? Is there a size or format limit on what you can attach? (H3)
7. What's the most annoying part of that process? (H2)

**Updating**
8. Think of the last family you saw again at follow-up. How did you update their pedigree, and how long did it take? (H9)

**Tools and IT**
9. What computer do you draw on? Is it shared? Do you log in as yourself? (H5)
10. Have you ever tried to get a new tool approved? What were you asked, and how long did it take? (H5)
11. *Hospital only:* which formats can your system import? If you drafted a pedigree somewhere else and attached or imported it, would anyone object? Would you do it anyway? (H5)
12. *Private or trainee only:* who decides what tools you use? (H6)
13. *Private only:* what do you pay for software today? What would a pedigree tool have to save you before a monthly fee was worth it? (H7)

**Paper and photos**
14. Do you keep paper pedigrees? About how many? (H10)
15. Would you photograph one to turn it into a digital pedigree? Would your service allow a photo of patient data to leave the device? (H10)

**Wrap-up**
16. Where did you hear about the tools you use now? Who would you tell about a good one? *Trainees:* did a lecturer or supervisor point you to it? (H6)
17. Who else should I talk to?

Skip 11, 12 or 13 when it doesn't apply to the persona's segment, and say so.

**Usability follow-ups** (asked after the usability task)
1. Would you use this in a real consult tomorrow? What would stop you? (H2)
2. Would you file this pedigree as it is, or redraw it first? What would you change? (H8)
3. What would you need it to export to? (H3, H4)
4. What's missing?

## Output template

```markdown
# <P-id> interview · round <round> · SYNTHETIC

Persona: <P-id> v<version> · Protocol: interview v1 · Evidence: v<n>

## Answers
### 1. <question>
<answer>
Grounding: [E#] [A]
...

## Log row
| Date | Person | Segment | Current tool | H1 | H2 | H3 | H4 | H5 | H6 | H7 | H8 | H9 | H10 | Formats they need | Quote |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| <date> | <P-id> (synthetic) | ... |

## Hypothesis reasons
- H1: ...

## Questions this persona could not really answer
## Questions that felt weak
```
