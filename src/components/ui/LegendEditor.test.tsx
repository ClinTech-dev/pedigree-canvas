/**
 * RTL tests for the Legend editor's new-entry defaults and lookalike warning
 * (issue #174). The editor is plain react-dom, so it renders under jsdom; the
 * default-picking and "identical" logic itself is unit-tested in
 * `utils/conditionDefaults.test.ts`.
 */
import { render, screen, act, fireEvent, within } from '@testing-library/react';
import { beforeEach, describe, it, expect } from 'vitest';
import { usePedigreeStore, createDefaultDocument } from '../../stores/pedigreeStore';
import { useUIStore } from '../../stores/uiStore';
import type { LegendEntry } from '../../types/pedigree';
import { LegendEditor } from './LegendEditor';

function seed(entries: LegendEntry[] = []) {
  const doc = createDefaultDocument();
  doc.legendConfig.entries = entries;
  act(() => {
    usePedigreeStore.getState().setDocument(doc);
    useUIStore.setState({ activeModal: 'legendEditor' });
  });
}

function entries(): LegendEntry[] {
  return usePedigreeStore.getState().document.legendConfig.entries;
}

beforeEach(() => {
  act(() => {
    usePedigreeStore.getState().setDocument(createDefaultDocument());
    useUIStore.setState({ activeModal: null });
  });
});

describe('LegendEditor new-entry defaults', () => {
  it('gives each added condition the next free quarter and an unused pattern', () => {
    seed();
    render(<LegendEditor />);
    const add = screen.getByRole('button', { name: '+ Add Condition' });
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(add);

    expect(entries().map((e) => [e.quarter, e.fillPattern, e.fillColor])).toEqual([
      ['topRight', 'solid', '#1a1a1a'],
      ['topLeft', 'diagonalLines', '#1a1a1a'],
      ['bottomLeft', 'dots', '#1a1a1a'],
    ]);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('leaves existing entries untouched when adding one', () => {
    const existing: LegendEntry = {
      id: 'a',
      name: 'Breast cancer',
      quarter: 'bottomRight',
      fillColor: '#2563eb',
      fillPattern: 'dots',
    };
    seed([existing]);
    render(<LegendEditor />);
    fireEvent.click(screen.getByRole('button', { name: '+ Add Condition' }));

    expect(entries()[0]).toEqual(existing);
    expect(entries()[1]).toMatchObject({ quarter: 'topRight', fillPattern: 'solid' });
  });
});

describe('LegendEditor lookalike warning', () => {
  const breast: LegendEntry = {
    id: 'a',
    name: 'Breast cancer',
    quarter: 'topRight',
    fillColor: '#1a1a1a',
    fillPattern: 'solid',
  };
  const ovarian: LegendEntry = { ...breast, id: 'b', name: 'Ovarian cancer' };

  it('warns when two entries would render identically', () => {
    seed([breast, ovarian]);
    const { container } = render(<LegendEditor />);

    const warning = screen.getByRole('status');
    expect(within(warning).getByText('Two conditions look the same')).toBeInTheDocument();
    expect(warning).toHaveTextContent(/Breast cancer and Ovarian cancer have the same quarter/);
    expect(container.querySelectorAll('[data-lookalike]')).toHaveLength(2);
  });

  it('clears the warning once one entry is changed', () => {
    seed([breast, ovarian]);
    render(<LegendEditor />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      usePedigreeStore.getState().updateLegendEntry('b', { fillPattern: 'dots' });
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not block editing or removing lookalike entries', () => {
    seed([breast, ovarian]);
    render(<LegendEditor />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove condition' })[1]);
    expect(entries()).toEqual([breast]);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
