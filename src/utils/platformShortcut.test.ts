import { describe, it, expect } from 'vitest';
import { isMacPlatform, formatShortcut, ariaKeyShortcut } from './platformShortcut';

describe('isMacPlatform', () => {
  it('detects macOS via userAgentData, platform, or userAgent', () => {
    expect(isMacPlatform({ userAgentData: { platform: 'macOS' } })).toBe(true);
    expect(isMacPlatform({ platform: 'MacIntel' })).toBe(true);
    expect(isMacPlatform({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' })).toBe(true);
  });

  it('is false on Windows, Linux, and with no navigator', () => {
    expect(isMacPlatform({ userAgentData: { platform: 'Windows' } })).toBe(false);
    expect(isMacPlatform({ platform: 'Win32' })).toBe(false);
    expect(isMacPlatform({ platform: 'Linux x86_64' })).toBe(false);
    expect(isMacPlatform(undefined)).toBe(false);
  });
});

describe('formatShortcut', () => {
  it('leaves Mac shortcuts unchanged on a Mac', () => {
    expect(formatShortcut('⌘K', true)).toBe('⌘K');
    expect(formatShortcut('⌘⇧Z', true)).toBe('⌘⇧Z');
  });

  it('spells out modifiers with Ctrl on Windows/Linux', () => {
    expect(formatShortcut('⌘K', false)).toBe('Ctrl+K');
    expect(formatShortcut('⌘⇧Z', false)).toBe('Ctrl+Shift+Z');
    expect(formatShortcut('⌥', false)).toBe('Alt');
    expect(formatShortcut('⌫', false)).toBe('Delete');
    expect(formatShortcut('⌥ + Drag', false)).toBe('Alt + Drag');
  });

  it('passes plain keys through on every platform', () => {
    expect(formatShortcut('?', false)).toBe('?');
    expect(formatShortcut('G', true)).toBe('G');
  });
});

describe('ariaKeyShortcut', () => {
  it('maps ⌘ to Meta on Mac and Control elsewhere', () => {
    expect(ariaKeyShortcut('⌘O', true)).toBe('Meta+O');
    expect(ariaKeyShortcut('⌘O', false)).toBe('Control+O');
    expect(ariaKeyShortcut('⌘⇧Z', false)).toBe('Control+Shift+Z');
    expect(ariaKeyShortcut('Z', false)).toBe('Z');
  });
});
