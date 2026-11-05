/**
 * Platform-aware keyboard-shortcut labels (issue #178).
 *
 * Shortcuts are authored once, Mac-style (`⌘K`, `⌘⇧Z`, `⌥`, `⌫`), and passed
 * through {@link formatShortcut} wherever they are *displayed*, so Windows and
 * Linux users see `Ctrl+K`, `Ctrl+Shift+Z`, `Alt`, `Delete` instead of glyphs
 * their keyboards don't have. The bindings themselves (useKeyboardShortcuts)
 * already accept either ⌘ or Ctrl — this is display only.
 */

/** Minimal navigator shape we read, so tests can pass a fake. */
export interface NavigatorLike {
  platform?: string;
  userAgent?: string;
  userAgentData?: { platform?: string };
}

/**
 * True when the user is on macOS / iOS (where ⌘ and ⌥ are the right labels).
 *
 * Prefers `navigator.userAgentData.platform` (Chromium), then the legacy
 * `navigator.platform`, then the user-agent string.
 *
 * @param nav Navigator to inspect; defaults to the global one (absent → false).
 */
export function isMacPlatform(
  nav: NavigatorLike | undefined = typeof navigator === 'undefined'
    ? undefined
    : (navigator as NavigatorLike),
): boolean {
  if (!nav) return false;
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** Mac modifier glyph → its non-Mac display word. */
const NON_MAC_TOKENS: Record<string, string> = {
  '⌘': 'Ctrl',
  '⇧': 'Shift',
  '⌥': 'Alt',
  '⌃': 'Ctrl',
  '⌫': 'Delete',
};

/** Mac modifier glyph → its `aria-keyshortcuts` key name, per platform. */
const ARIA_TOKENS: Record<string, { mac: string; other: string }> = {
  '⌘': { mac: 'Meta', other: 'Control' },
  '⇧': { mac: 'Shift', other: 'Shift' },
  '⌥': { mac: 'Alt', other: 'Alt' },
  '⌃': { mac: 'Control', other: 'Control' },
  '⌫': { mac: 'Backspace', other: 'Delete' },
};

/** Split a Mac-style shortcut into tokens: each glyph alone, the rest as one key. */
function tokenize(spec: string): string[] {
  const tokens: string[] = [];
  let rest = '';
  for (const ch of spec) {
    if (ch in NON_MAC_TOKENS) {
      if (rest) {
        tokens.push(rest);
        rest = '';
      }
      tokens.push(ch);
    } else {
      rest += ch;
    }
  }
  if (rest) tokens.push(rest);
  return tokens;
}

/**
 * Format a Mac-style shortcut for display on the current platform.
 *
 * On a Mac the string is returned unchanged (`⌘⇧Z`). Elsewhere each modifier
 * glyph becomes a word joined with `+` (`Ctrl+Shift+Z`); a lone modifier
 * (`⌥`) becomes just its word (`Alt`). Strings with no glyphs (`?`, `G`)
 * pass through untouched.
 *
 * @param spec Mac-style shortcut, e.g. `⌘K`.
 * @param mac Override platform detection (tests).
 */
export function formatShortcut(spec: string, mac: boolean = isMacPlatform()): string {
  if (mac) return spec;
  // Join modifiers with '+', except before a token that brings its own
  // spacing (`⌥ + Drag` → `Alt + Drag`, not `Alt+ + Drag`).
  return tokenize(spec).reduce(
    (out, t, i) => out + (i > 0 && !/^\s/.test(t) ? '+' : '') + (NON_MAC_TOKENS[t] ?? t),
    '',
  );
}

/**
 * Convert a Mac-style shortcut to an `aria-keyshortcuts` value
 * (`⌘O` → `Meta+O` on Mac, `Control+O` elsewhere).
 *
 * @param spec Mac-style shortcut, e.g. `⌘O`.
 * @param mac Override platform detection (tests).
 */
export function ariaKeyShortcut(spec: string, mac: boolean = isMacPlatform()): string {
  return tokenize(spec)
    .map((t) => {
      const aria = ARIA_TOKENS[t];
      return aria ? (mac ? aria.mac : aria.other) : t;
    })
    .join('+');
}
