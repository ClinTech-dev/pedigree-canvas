import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImportExportModal } from './ImportExportModal';
import { useUIStore } from '../../stores/uiStore';

vi.mock('../../io/svgExport', () => ({ exportToSvg: vi.fn() }));

beforeEach(() => {
  useUIStore.setState({ activeModal: null });
});

describe('ImportExportModal status messages (#178)', () => {
  it('does not carry an export status into the Import dialog', () => {
    act(() => useUIStore.getState().openModal('export'));
    render(<ImportExportModal getStage={() => null} />);

    fireEvent.click(screen.getByRole('button', { name: /SVG Image/ }));
    expect(screen.getByText('SVG exported.')).toBeInTheDocument();

    // Escape / other paths close via the store, not the modal's own handler.
    act(() => useUIStore.getState().closeModal());
    act(() => useUIStore.getState().openModal('import'));

    expect(screen.getByRole('heading', { name: 'Import Pedigree' })).toBeInTheDocument();
    expect(screen.queryByText('SVG exported.')).toBeNull();
  });

  it('clears an error when the dialog is reopened', () => {
    act(() => useUIStore.getState().openModal('export'));
    render(<ImportExportModal getStage={() => null} />);

    fireEvent.click(screen.getByRole('button', { name: /PDF Document/ }));
    expect(screen.getByText('Canvas not available.')).toBeInTheDocument();

    act(() => useUIStore.getState().closeModal());
    act(() => useUIStore.getState().openModal('export'));
    expect(screen.queryByText('Canvas not available.')).toBeNull();
  });
});
