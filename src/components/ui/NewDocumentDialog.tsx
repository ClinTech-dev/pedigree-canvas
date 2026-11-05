import * as Dialog from '@radix-ui/react-dialog';
import { useUIStore } from '../../stores/uiStore';
import { startNewDocumentAction } from '../../commands/editorActions';
import overlay from './HelpOverlay.module.css';
import styles from './NewDocumentDialog.module.css';

/**
 * "Start a new pedigree?" confirmation (issue #178).
 *
 * The working document lives only in this browser's autosave, so "New" would
 * silently throw away the only copy. This dialog says so plainly and offers to
 * export first; choosing Export opens the export modal *without* replacing the
 * document (the user clicks New again once they have their copy).
 *
 * Driven by `useUIStore` — open while `activeModal === 'confirmNew'`, opened by
 * `requestNewDocumentAction`. Reuses the Help overlay's dialog chrome.
 */
export function NewDocumentDialog(): React.JSX.Element {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const openModal = useUIStore((s) => s.openModal);

  const open = activeModal === 'confirmNew';

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) closeModal();
  };

  const handleExportFirst = (): void => {
    openModal('export');
  };

  const handleDiscard = (): void => {
    closeModal();
    startNewDocumentAction();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlay.overlay} />
        <Dialog.Content className={`${overlay.panel} ${styles.panel}`}>
          <Dialog.Title asChild>
            <header className={overlay.header}>
              <h2 className={overlay.title}>Start a new pedigree?</h2>
            </header>
          </Dialog.Title>
          <div className={overlay.body}>
            <Dialog.Description className={styles.message}>
              Your current pedigree will be replaced. It is only kept in this
              browser and isn&apos;t saved anywhere else, so export a copy first
              if you want to keep it.
            </Dialog.Description>
            <div className={styles.actions}>
              <Dialog.Close asChild>
                <button type="button" className={styles.button}>
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                className={`${styles.button} ${styles.danger}`}
                onClick={handleDiscard}
              >
                Discard and start new
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.primary}`}
                onClick={handleExportFirst}
                autoFocus
              >
                Export first…
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
