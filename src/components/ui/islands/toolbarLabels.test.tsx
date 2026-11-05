/**
 * Every icon button in the floating islands needs a hover tooltip (`title`)
 * and an accessible name (#178: personas couldn't tell what the Reformat wand
 * did). Guards against a new icon-only button shipping without either.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useUIStore } from '../../../stores/uiStore';
import { ActionsIsland } from './ActionsIsland';
import { ToolIsland } from './ToolIsland';
import { ZoomIsland } from './ZoomIsland';
import { HistoryIsland } from './HistoryIsland';
import { HelpIsland } from './HelpIsland';

beforeEach(() => {
  useUIStore.setState({
    activeModal: null,
    propertiesPanelOpen: false,
    zenMode: false,
    editingLocked: false,
  });
});

describe('island toolbar buttons', () => {
  it('all have a tooltip and an accessible name', () => {
    render(
      <>
        <ActionsIsland />
        <ToolIsland />
        <ZoomIsland />
        <HistoryIsland />
        <HelpIsland />
      </>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(10);
    for (const button of buttons) {
      expect(button.getAttribute('title'), button.outerHTML).toBeTruthy();
      expect(
        button.getAttribute('aria-label') || button.textContent?.trim(),
        button.outerHTML,
      ).toBeTruthy();
    }
  });

  it('labels the Reformat wand', () => {
    render(<ActionsIsland />);
    const wand = screen.getByRole('button', { name: 'Reformat pedigree' });
    expect(wand.getAttribute('title')).toMatch(/reformat/i);
  });

  it('shows the platform undo shortcut (Ctrl off a Mac)', () => {
    render(<HistoryIsland />);
    expect(screen.getByRole('button', { name: 'Undo' }).getAttribute('title')).toBe(
      'Undo (Ctrl+Z)',
    );
  });
});
