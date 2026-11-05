import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NewDocumentDialog } from './NewDocumentDialog';
import { useUIStore } from '../../stores/uiStore';
import {
  usePedigreeStore,
  createDefaultDocument,
  createDefaultIndividual,
} from '../../stores/pedigreeStore';
import { requestNewDocumentAction } from '../../commands/editorActions';

function seedTwoPeople(): void {
  usePedigreeStore.getState().setDocument(createDefaultDocument());
  usePedigreeStore.getState().addIndividual(createDefaultIndividual({ id: 'a' }));
  usePedigreeStore.getState().addIndividual(createDefaultIndividual({ id: 'b' }));
}

beforeEach(() => {
  useUIStore.setState({ activeModal: null });
  seedTwoPeople();
});

describe('NewDocumentDialog (#178)', () => {
  it('warns that the pedigree is not saved elsewhere before replacing it', () => {
    render(<NewDocumentDialog />);
    act(() => requestNewDocumentAction());

    expect(screen.getByRole('dialog', { name: 'Start a new pedigree?' })).toBeInTheDocument();
    expect(screen.getByText(/isn.t saved anywhere else/i)).toBeInTheDocument();
    // Nothing replaced yet.
    expect(Object.keys(usePedigreeStore.getState().document.individuals)).toEqual(['a', 'b']);
  });

  it('"Export first" opens the export modal and keeps the document', () => {
    render(<NewDocumentDialog />);
    act(() => requestNewDocumentAction());

    fireEvent.click(screen.getByRole('button', { name: /export first/i }));

    expect(useUIStore.getState().activeModal).toBe('export');
    expect(Object.keys(usePedigreeStore.getState().document.individuals)).toEqual(['a', 'b']);
  });

  it('Cancel closes without replacing', () => {
    render(<NewDocumentDialog />);
    act(() => requestNewDocumentAction());

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(useUIStore.getState().activeModal).toBeNull();
    expect(Object.keys(usePedigreeStore.getState().document.individuals)).toEqual(['a', 'b']);
  });

  it('"Discard and start new" replaces the document with a fresh seed', () => {
    render(<NewDocumentDialog />);
    act(() => requestNewDocumentAction());

    fireEvent.click(screen.getByRole('button', { name: /discard and start new/i }));

    expect(useUIStore.getState().activeModal).toBeNull();
    const ids = Object.keys(usePedigreeStore.getState().document.individuals);
    expect(ids).toHaveLength(1);
    expect(ids).not.toContain('a');
  });
});
