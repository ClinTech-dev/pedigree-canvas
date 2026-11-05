# Evidence register

Version: **2** (2026-11-05; v2 revised the hypotheses). Distilled from the desk research doc
["Pedigree Canvas: who draws pedigrees and what limits them"](https://claude.ai/artifact/HcgwAkFxgCB2exrVKmz9jk).
Persona cards cite these ids. When the desk research changes, add new ids rather
than renumbering, and bump the version.

## Who draws pedigrees

| Id | Evidence | Source |
|---|---|---|
| E1 | Genetic counsellors draw a pedigree in almost every consult; one per new family, updated at follow-up. | Desk research, "Who draws pedigrees" |
| E2 | Cancer genetics is the largest specialty: 34% of US counsellors. | [NSGC 2023](https://perspectives.nsgc.org/Article/key-findings-from-professional-status-survey) |
| E3 | 82% of US counsellors use audiovisual telehealth; many pedigrees are drawn on a laptop during a video call. | [NSGC 2023](https://perspectives.nsgc.org/Article/key-findings-from-professional-status-survey) |
| E4 | Of 128 US cancer counsellors: 55.7% hospital direct care, 37.9% university medical centre, 6.4% private company. | [Ritchie et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7434745) |
| E5 | Trainees and students learn Bennett/NSGC nomenclature and draw for exams and case reports; few IT limits; free tools win. | Desk research, profession table |
| E6 | Specialist nurses and oncology, cardiac, neuro and fertility clinicians take short histories, often a 3-generation sketch; low frequency, need speed over completeness. | Desk research, profession table |
| E7 | Clinical geneticists review and annotate counsellor pedigrees and draw complex families; care about layout of large or consanguineous families. | Desk research, profession table |
| E8 | Educators need slides and teaching material; value clean vector export. | Desk research, profession table |
| E9 | Australian and UK workforce numbers and settings are not yet covered by the research. | Desk research, open question |

## What they use today

| Id | Evidence | Source |
|---|---|---|
| E10 | 52.8% of cancer counsellors used pedigree software; about half still draw by hand. | [Ritchie et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7434745) |
| E11 | 69.7% of software users used Progeny. | [Ritchie et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7434745) |
| E12 | 31.3% of software users were looking to switch; 41.8% of all respondents were considering changing or adopting a tool. | [Ritchie et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7434745) |
| E13 | Progeny offers a free online pedigree tool for students and counsellors. | [Progeny blog](https://www.progenygenetics.com/blog/new-and-improved-free-online-pedigree-tool-released/) |
| E14 | TrakGene (pedigree plus genetics database) claims over 800 clinicians; PhenoTips is sold through cloud marketplaces to health systems. | [AVIA](https://marketplace.aviahealth.com/product/77394/trakgene/competitors/alternatives), [Microsoft marketplace](https://marketplace.microsoft.com/en-sa/product/phenotips.core) |
| E15 | 61.1% of surveyed counsellors used Epic; EHRs had the highest dissatisfaction (18.3%). | [Ritchie et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7434745) |
| E16 | Hand-drawn pedigrees are scanned or photographed into the record: fast, but not searchable or standardised. | Desk research, tools table |
| E17 | Buying happens at service level: NHS South West tendered in 2023 for a 5-year pedigree software contract listed at £300K. | [Find a Tender](https://bidstats.uk/tenders/2023/W37/806486103) |

## IT limits

| Id | Evidence | Source |
|---|---|---|
| E18 | In public hospitals any unapproved tool is "shadow IT", even a free web app; SaaS where information leaves the service is a named risk. | [Metro North Health](https://metronorth.health.qld.gov.au/extranet/?p=5992) |
| E19 | Getting a tool approved means an IT request describing problem, data and risks; assessment takes about five business days. | [Metro North Health](https://metronorth.health.qld.gov.au/extranet/?p=5992) |
| E20 | Shared clinic PCs make browser autosave a privacy risk; hospitals may clear or block local storage. | Desk research, IT section (inference) |
| E21 | NHS buyers ask for DCB0129 clinical-safety evidence; Australian buyers may ask about TGA SaMD status. A drawing tool is probably not a medical device; risk calculation would change that. | Desk research, IT section (inference, not legal advice) |
| E22 | Private clinics and trainees can usually adopt a web tool themselves. | Desk research, IT section |

## Workflow

| Id | Evidence | Source |
|---|---|---|
| E23 | The pain is re-entry: draw in consult, retype into a risk calculator, retype into the EHR family-history table, then summarise in a note. | [HL7 panel 2015](https://www.hcinnovationgroup.com/policy-value-based-care/article/13025488/ehrs-fall-short-on-family-history-tools-hl7-conference-panelists-say) |
| E24 | Common cancer risk calculators: CanRisk, Tyrer-Cuzick. | Desk research, workflow table |
| E25 | PDF and PNG can be attached to most EHRs; structured import (FHIR family history, `.ped`) is rare. | Desk research, IT section |
| E26 | Between visits, the file has to live somewhere; on a locked-down PC that is an open question. | Desk research, workflow table |
| E27 | Private clinics want professional-looking output for referral letters (letterhead, de-identify). | Desk research, features table |
| E28 | Bottom-up hospital route: individuals draft in Pedigree Canvas, export, and import into Progeny, TrakGene or the EHR, if allowed. | Desk research, "Private vs hospital" |

## Segments and buying

| Id | Evidence | Source |
|---|---|---|
| E29 | Private/telehealth/trainee/educator: the individual or practice owner decides, adopts in days, pays free to a small per-seat subscription, reached through training programmes, societies, word of mouth. | Desk research, segment table |
| E30 | Public hospital: service lead, then IT, governance and procurement decide; 6 to 18 months; wins on privacy and clinical-safety paperwork, EHR fit, support and a contract. | Desk research, segment table |
| E31 | About half of counsellors hold a stack of paper pedigrees; photo import would move it in, but a patient photo leaving the device conflicts with local-first. | Desk research, features section |

## Hypotheses

Version 2 (2026-11-05), revised with Josh after usability round 1. The interview
guide and protocols tag questions with these ids.

| Id | Hypothesis | Main segment | Tested by |
|---|---|---|---|
| H1 | Speed: Pedigree Canvas is faster than paper for a 3-generation family in a live consult. | All | Timed usability task; Q3, Q4 |
| H2 | Switch reason: counsellors would switch for something other than raw speed (easy updates, a clean output, showing the patient on a telehealth call). | Private / telehealth, hospital | Q4, Q7, follow-up 1 |
| H3 | Into the record: a PDF attached to the record is good enough, provided it fits the record's size and format limits. | All | Q6, follow-up 3 |
| H4 | Re-entry: retyping the family into risk calculators and the EHR hurts more than drawing it. | Cancer counsellors | Q3, Q5 |
| H5 | Bottom-up route: hospital counsellors are allowed to (or will anyway) draft in an unapproved local-first web tool and attach or import the result, including on shared PCs. IT's own view is tested with one IT or privacy person, not counsellors. | Hospital | Q9–Q11, plus one IT or privacy interview |
| H6 | Channels: educators are the main channel to trainees; colleagues are the main channel to private counsellors. | Trainees, private | Q12, Q16 |
| H7 | Willingness to pay: private clinics will pay a small per-seat subscription. | Private / telehealth | Q13 |
| H8 | Trust: clinicians will file the output as is, without redrawing it. | All | Follow-up 2 |
| H9 | Updates: updating a family at follow-up hurts more than the first draw. | All | Q8 |
| H10 | Photo import: people hold a backlog of paper pedigrees and would photograph them to digitise. | Hand-drawers, hospital | Q14, Q15 |

Changes from version 1: old H1 split into H1 and H2; old H2 became H3 with a size
limit; old H3 became H4; old H4 (IT allows it) and H6 (shared PCs) merged into H5,
the bottom-up route; old H5 narrowed into H6; H7 to H10 are new.
