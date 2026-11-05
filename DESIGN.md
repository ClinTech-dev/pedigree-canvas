---
name: Pedigree Canvas
description: Clinical pedigree drawing for geneticists and genetic counsellors — a quiet instrument where the pedigree is the hero.
colors:
  ward-green: "#344c3e"
  canvas-selection: "#2f7d52"
  ward-green-hover: "#2a3e32"
  ward-green-soft: "#344c3e1a"
  ward-green-soft-strong: "#344c3e29"
  ward-green-border: "#344c3e47"
  bg: "#f9fafa"
  surface: "#ffffff"
  border: "#e2e5e3"
  border-strong: "#cfd3d1"
  ink: "#1b1d1c"
  ink-secondary: "#515654"
  danger: "#dc2626"
  warning: "#d97706"
  success: "#16a34a"
  warm-bg: "#fff8e1"
  warm-surface: "#fffdf6"
  dim-bg: "#d6d3cd"
  dim-surface: "#e2e0db"
  symbol-stroke: "#1a1a1a"
  symbol-fill: "#ffffff"
  grid: "#e5e5e5"
  condition-black: "#1a1a1a"
  condition-red: "#e63946"
  condition-blue: "#457b9d"
  condition-teal: "#2a9d8f"
typography:
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  annotation:
    fontFamily: "'Caveat', cursive"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "50%"
spacing:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  edge: "14px"
components:
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "32px"
    width: "32px"
  icon-button-active:
    backgroundColor: "{colors.ward-green-soft}"
    textColor: "{colors.ward-green}"
    rounded: "{rounded.sm}"
  tool-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "48px"
    width: "40px"
  button-primary:
    backgroundColor: "{colors.ward-green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    typography: "{typography.label}"
    padding: "0 8px"
  button-primary-hover:
    backgroundColor: "{colors.ward-green-hover}"
    textColor: "{colors.surface}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "6px 8px"
  island:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "6px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px"
    width: "280px"
---

# Design System: Pedigree Canvas

## 1. Overview

**Creative North Star: "The Clinical Drafting Table"**

Pedigree Canvas is a calm, well-lit surface where a clinician draws a family
pedigree. The drawing *is* the document; everything else is a tool laid at the
edge of the table, within reach but never in the way. The canvas fills the entire
viewport, and the chrome — a set of small floating "islands" — hovers over it
rather than framing it. Nothing here competes with the pedigree for attention.

The personality, straight from PRODUCT.md, is a **quiet professional instrument:
precise, calm, approachable.** It is a ClinTech product and a sibling of Issued: it shares
Ward Green, the sage neutrals and Inter with the rest of the family. Its working
habits still descend from Excalidraw (floating islands, a single hand-drawn font
for hints) without the whiteboard's casualness. Warmth is carried
by generous spacing, plain-clinical copy, and the option of a warmer canvas tint —
never by decoration. Confidence is carried by restraint: familiar controls,
tight radii, subtle state changes, and an accent used so sparingly that when it
appears you know exactly what it means.

This system explicitly rejects four things: **dated enterprise medical software**
(dense gray toolbars, tiny fonts, modal soup); **sterile, cold clinical UI**
(stark and intimidating to a stressed user); **the generic SaaS dashboard**
(card grids, gradient hero-metrics, tracked-uppercase eyebrows on every section);
and **playful/gamified** treatments (mascots, emoji, bounce, candy palettes). The
tool documents clinical reality; it should disappear into that task.

**Key Characteristics:**
- **Canvas-first.** Full-bleed drawing surface; chrome floats, never reflows the canvas.
- **On-demand UI.** Controls appear where and when needed (radial menu on a symbol, panel on selection).
- **One accent, used rarely.** Ward Green marks primary action, active state, and focus; a brighter family green marks canvas selection. Nothing decorative.
- **Standards-locked canvas.** Symbols stay dark-on-light in every theme; fill is semantic (filled = affected).
- **Redundant encoding.** Colour is never the only channel — condition fills also carry a pattern.
- **Comfort, not modes.** Light / Warm / Dim re-tint the surface's warmth and luminance; there is no dark mode.

## 2. Colors

The ClinTech family palette: a sage off-white workspace, ink-black text and
symbols, and Ward Green doing the interactive work. The only
saturated colours on screen are the user's own condition-shading choices.

### Primary
- **Ward Green** (`#344c3e`): The family's one brand hue, shared with Issued and
  the ClinTech site. Primary action, active tool state, input focus, the current
  command-palette row, and the product mark. Hover deepens to **Ward Green Hover**
  (`#2a3e32`). Never decoration.
- **Canvas Selection** (`#2f7d52`, `SELECTION_COLOR`): Selected symbols and
  connection lines, the marquee, and hover highlights, on the canvas only. Ward
  Green is 1.86:1 against the ink symbols, so a selected symbol would not stand
  out. This green holds at least 3:1 against ink and against every comfort theme's
  paper. It never appears in exports.
- **Ward Green Tints** (`#344c3e` at 10% / 16% / 28% alpha): The soft, soft-strong,
  and border tints give active controls a wash and outline without a full fill.
- **Connect gesture:** the source ring and dashed preview use Ward Green; a valid
  target uses Success green, so the two are separated by brightness as well as hue.

### Neutral
- **Ink** (`#1b1d1c`, Sage 900): Primary chrome text.
- **Symbol Ink** (`#1a1a1a`): Every pedigree symbol stroke (`SYMBOL_COLOR`) and
  connection line (`LINE_COLOR`). The canvas is ink-on-paper and does not take the
  brand's tint.
- **Ink Secondary** (`#515654`, Sage 600): Secondary/muted text — section titles, hints,
  shortcut chips, zoom readout. Holds ≥4.5:1 on the light surfaces; do not push it
  lighter.
- **Workspace** (`#f9fafa`, Sage 50): The app background / canvas backdrop showing
  through the transparent Konva stage.
- **Surface** (`#ffffff`): Islands, panels, menus, and the fill of open
  (unaffected) symbols.
- **Border** (`#e2e5e3`, Sage 200) / **Border Strong** (`#cfd3d1`, Sage 300): Hairline
  1px borders and dividers on all chrome; the stronger step for small popovers.

### Tertiary — Clinical / Canvas
- **Symbol Fill** (`#ffffff` light, `#fffdf6` warm, `#e4e1db` dim): The "paper"
  fill of open symbols; re-tinted per comfort theme but always high-luminance.
- **Grid** (`#e5e5e5`): Background dot grid and generation guide lines; the
  faintest mark on the canvas.
- **Condition Palette** — the default legend swatches (`DEFAULT_CONDITION_COLORS`):
  **Clinical Black** (`#1a1a1a`), **Signal Red** (`#e63946`), **Steel Blue**
  (`#457b9d`), **Sea Teal** (`#2a9d8f`). Chosen to stay distinguishable from each
  other; the user assigns them to conditions in the legend.

### Semantic
- **Danger** (`#dc2626`): Destructive actions (remove relationship), clash
  warnings, error borders.
- **Warning** (`#d97706`) · **Success** (`#16a34a`): Reserved for status; use
  sparingly.

### Comfort Themes (chrome only)
Three surfaces re-tint the chrome and canvas backdrop, switched via
`data-theme` on `<html>`: **Light** (default, sage off-white), **Warm**
(`#fff8e1` — pale amber, reduces blue light), **Dim** (`#d6d3cd` — low-luminance
cool grey for dark rooms). All stay light so dark symbols keep their meaning.

### Named Rules
**The One Accent Rule.** Green appears on ≤10% of any screen and always means
"this is active / selected / the primary action." If green is decorating
something inert, it is wrong. Remove it or make the element actually interactive.

**The Semantic Fill Rule.** On the canvas, fill is meaning, not style. A filled
symbol is an affected individual; an open symbol is unaffected. Never invert the
canvas to a dark theme, never tint a symbol fill for aesthetics. This is why there
is no dark mode — only comfort themes that keep symbols dark-on-light.

**The Redundant-Colour Rule.** Any colour that encodes clinical meaning (condition
shading, test-result status) must be paired with a second channel — a fill
*pattern* (`diagonalLines`, `dots`, `crosshatch`, `stripes`) or a label — so a
colour-blind reader loses nothing. Colour alone is never sufficient.

## 3. Typography

**UI Font:** Inter, self-hosted from `public/fonts` so the app makes no third-party
font requests, in keeping with its nothing-leaves-your-browser promise. This is the
family's one sans, shared with Issued and the ClinTech site.

**Mono Font:** `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
monospace` — the system monospace, same commitment as the UI sans. Used only
for keyboard-shortcut chips.

**Hint Font:** **Caveat** (`cursive`), self-hosted. Used only for first-run
onboarding hints and the landing page's notes. It never appears in a pedigree or
an export.

**Character:** A compact, information-dense UI voice. Inter does all the
work — titles, labels, body, data — differentiated by size and weight, not by
family. Caveat is the one expressive counterpoint, and it stays out of the
clinical document. No display type: this is a tool, not a page.

### Hierarchy
- **Title** (600, 11px, uppercase, `0.05em` tracking): Panel section headers
  ("CONDITIONS", "RELATIONSHIP"). The one place tracked-uppercase is legitimate —
  a tiny functional label inside a panel, not a decorative section eyebrow.
- **Body** (400, 13–15px): Panel content, command-palette rows (14px), the search
  input (15px). Cap prose at 65–75ch; panels are far narrower, so this rarely binds.
- **Label** (500, 12px): Field labels, text-buttons, tool captions.
- **Mono / Shortcut** (400, 11px): Keyboard-shortcut chips in the command palette
  and tooltips. Rendered in a bordered chip on the workspace tint.
- **Canvas Label** (Inter, 12px, `#333`): Individual names/IDs sit below symbols;
  free-text notes float on the canvas in the same face.

### Named Rules
**The Size-and-Weight Rule.** Hierarchy comes from size and weight within one sans,
never from a second UI typeface. The only additional family permitted is Caveat,
and only for first-run hints and landing-page notes.

**The Fixed-Scale Rule.** Product UI uses a fixed px scale, never `clamp()`/fluid
type. A control that shrinks in a docked panel reads as broken, not responsive.

## 4. Elevation

**Flat chrome, soft-lifted islands.** Surfaces are flat at rest — the canvas, the
panel interiors, the buttons all sit on plain fills with 1px hairline borders.
Depth is reserved for one job: signalling that the floating islands and panels
*hover above the user's work*. That lift is a soft, low, ambient shadow, never a
hard drop shadow. Document exports (`svgExport`, `captureClean`) drop shadows
entirely — a printed pedigree is pure ink on paper.

### Shadow Vocabulary
- **Island Lift** (`box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)`):
  The canonical floating-chrome shadow — islands, the properties panel. A wide soft
  ambient layer plus a tight contact layer.
- **Token scale** (`--shadow-sm` / `--shadow-md` / `--shadow-lg`): Defined in
  `index.css` (cool-tinted `rgba(15,15,25,…)`). `--shadow-lg` lifts the command
  palette. *Note:* islands currently hardcode their own shadow instead of using
  `--shadow-md`; consolidating onto the tokens is a cleanup worth doing.
- **Segment Lift** (`0 1px 2px rgba(0,0,0,0.12)`): The tiny raised "thumb" of an
  active segmented-control option.

### Named Rules
**The Lift-Means-Floating Rule.** A shadow is permission to overlap the canvas —
nothing else. Flat surfaces stay flat; shadows never encode importance or
decorate a resting card. If it doesn't float over the user's work, it has no shadow.

## 5. Components

### Buttons
- **Shape:** `6px` radius (`--radius-sm`) on rectangular buttons; circles (`50%`)
  on the radial menu.
- **Icon button** (island): 32×32, transparent at rest, hover
  `rgba(0,0,0,0.06)`, active `rgba(0,0,0,0.1)`. When its tool/action is *on*, it
  takes the **Ward Green Soft** background with a Ward Green icon.
- **Tool button:** A taller 40×48 vertical stack — icon over an 11px shortcut
  badge; disabled tools drop to 0.4 opacity (not-allowed) while editing is locked.
- **Primary CTA:** Filled **Ward Green**, white text, `hover` → Ward Green
  Deep. Used only for the export action — the one moment the app pushes forward.
- **Transitions:** `background-color 0.1s`. Fast, state-only; no motion for its own sake.

### Inputs / Fields
- **Style:** surface colour, 1px `--color-border`, `6px` radius, 13px text.
- **Focus:** Border shifts to **Ward Green** (`border-color 0.15s`); no glow, no
  ring beyond the accent border. The command-palette input uses a Ward Green caret.
- **Controls:** Segmented controls (sex default, twin zygosity) use a recessed
  track with a white, softly-lifted active thumb. Standard native checkboxes/selects.

### Floating Islands (signature container)
- **Corner Style:** `10px` (`--radius-md`).
- **Background / Border:** surface colour, 1px `--color-border`.
- **Shadow:** Island Lift (see Elevation).
- **Padding:** `6px`; internal gap `4px`.
- **Behavior:** Positioned in five viewport-edge slots (14px insets). Slots are
  `pointer-events: none` so canvas pan/drag passes through the gaps; each island
  re-enables `pointer-events: auto`. `z-index: 10` over the canvas.

### Properties Panel
- **Style:** A right-edge floating panel (280px, island chrome), `overflow-y: auto`,
  16px padding. Sits *over* the canvas — never reflows it. Section titles use the
  11px uppercase Title style; fields stack with 10–12px rhythm.
- **Empty state:** Centered muted-secondary message that teaches, not "nothing here."

### Command Palette
- **Style:** A centered modal `<dialog>` (Radix) in the upper third — 560px,
  `14px` radius, `--shadow-lg`, on a `rgba(0,0,0,0.32)` backdrop.
- **Motion:** Backdrop `fadeIn 120ms`; panel `slideIn 140ms cubic-bezier(0.16,1,0.3,1)`
  (ease-out-expo). Rows highlight with Ward Green Soft; shortcuts shown as mono chips.

### Radial Add-Menu (signature canvas control)
- **Style:** Circular 32px option buttons orbiting a symbol at ±56–72px, white
  surface with hairline border and a subtle `0 1px 4px` shadow. Hover fills **Ward
  Green**; `:active` scales to `0.95`; hovered options scale to `1.1`.
- **Hover labels:** The four cardinal buttons show an instant dark chip
  ("Add partner (spouse / mate)") outward from the symbol on hover/focus, since
  the 8px caption alone was misread. The chip is kept out of the accessible
  name, which stays the visible caption.
- **Ghost previews:** MZ/DZ twin options start collapsed (`opacity: 0, scale 0.7`)
  and reveal on ~0.8s dwell or while ⌥ is held — faded (`opacity 0.5`) with a
  **dashed** border to read as a preview, solidifying on hover. This is the app's
  most distinctive interaction; keep its transitions at `0.15s`.

### Legend / Condition Editor
- **Swatches:** 26px round colour buttons; the selected one gets a **Ward Green**
  outline (`outline-offset: 2px`). **Quarter grid:** a 2×2 56px grid of toggleable
  cells (active → Ward Green) for choosing which quarters of a symbol a condition
  shades. Small 12px swatch + name in list rows.

## 6. Do's and Don'ts

### Do:
- **Do** keep the canvas full-bleed and let chrome float over it (`z-index: 10`,
  `pointer-events` gaps). The pedigree is the hero.
- **Do** reserve Ward Green (`#344c3e`) for the primary action, active state, and
  focus, and Canvas Selection (`#2f7d52`) for canvas selection — the One Accent
  Rule. Everywhere else, stay neutral.
- **Do** present the product as "A ClinTech product" in the About box and landing
  footer. The pedigree motif stays the product's mark; the ClinTech mark stays the
  company's.
- **Do** pair every meaning-bearing colour with a second channel — a fill pattern
  or a label — so condition shading survives colour-blindness (~8% of men).
- **Do** keep symbols dark-on-light in every theme; comfort themes re-tint warmth
  and luminance only. Fill is semantic.
- **Do** use the radius (`6/10/14px`) and shadow tokens; give floating chrome the
  Island Lift shadow and nothing at rest.
- **Do** build every interactive control with default / hover / focus / active /
  disabled states, and keep transitions short (100–150ms, state-only).
- **Do** use Inter for all UI type, and keep every font self-hosted.
- **Do** honor `prefers-reduced-motion` on the palette/menu entrances (fadeIn,
  slideIn) with a crossfade or instant fallback. *(Not yet implemented — add it.)*

### Don't:
- **Don't** build **dated enterprise medical software**: no dense gray toolbars,
  tiny fonts, or modal soup. Exhaust inline/progressive UI before reaching for a modal.
- **Don't** go **sterile or cold** — warmth lives in spacing and plain-clinical copy.
- **Don't** ship the **generic SaaS dashboard**: no card grids, no gradient
  hero-metrics, no purple-gradient buttons, no tracked-uppercase eyebrow above
  every section. (The only tracked-uppercase permitted is the 11px in-panel Title.)
- **Don't** go **playful or gamified**: no mascots, emoji, bounce/elastic easing,
  or candy palettes. This documents clinical reality.
- **Don't** use blue for active or selected states, or the Issued plum (`#6b5b95`),
  which the family reserves for AI-authored content.
- **Don't** introduce a dark mode or invert the canvas — it breaks the Semantic
  Fill Rule.
- **Don't** add a second UI typeface or use `clamp()`/fluid type. Hierarchy is
  size and weight in one sans; Caveat is for on-canvas annotations only.
- **Don't** use `border-left`/`border-right` > 1px as a coloured accent stripe, or
  `background-clip: text` gradient text. Use full hairline borders and solid colour.
- **Don't** push muted text lighter than **Ink Secondary** (`#515654`, Sage 600) for
  "elegance" — it fails contrast on the near-white surfaces.
