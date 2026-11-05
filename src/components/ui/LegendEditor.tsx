import { usePedigreeStore } from '../../stores/pedigreeStore';
import { useUIStore } from '../../stores/uiStore';
import type { LegendEntry } from '../../types/pedigree';
import { generateId } from '../../utils/idGenerator';
import {
  findIdenticalEntryGroups,
  pickConditionDefaults,
} from '../../utils/conditionDefaults';
import {
  ConditionColorPicker,
  ConditionQuarterGrid,
  ConditionPatternPicker,
} from './ConditionControls';
import { SegmentedControl } from './SegmentedControl';
import styles from './LegendEditor.module.css';

const APPLIES_TO_OPTIONS: { value: 'both' | 'man' | 'woman'; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'man', label: 'Men' },
  { value: 'woman', label: 'Women' },
];

export function LegendEditor() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const legendConfig = usePedigreeStore((s) => s.document.legendConfig);
  const addLegendEntry = usePedigreeStore((s) => s.addLegendEntry);
  const updateLegendEntry = usePedigreeStore((s) => s.updateLegendEntry);
  const removeLegendEntry = usePedigreeStore((s) => s.removeLegendEntry);

  if (activeModal !== 'legendEditor') return null;

  const handleAdd = () => {
    // Conditions may share a quarter (they are differentiated by colour /
    // pattern), so there is no per-quarter cap. Each new condition starts in
    // the next free quarter with a pattern not used yet (issue #174), so
    // accepting the defaults never gives two lookalike conditions. Read the
    // entries imperatively: this is a handler, not a render.
    const entries = usePedigreeStore.getState().document.legendConfig.entries;
    addLegendEntry({
      id: generateId(),
      ...pickConditionDefaults(entries),
      name: 'New Condition',
    });
  };

  const identicalGroups = findIdenticalEntryGroups(legendConfig.entries);
  const lookalikeIds = new Set(identicalGroups.flat().map((e) => e.id));

  return (
    <div className={styles.backdrop} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Legend / Key</h2>
          <button
            className={styles.closeButton}
            onClick={closeModal}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {legendConfig.entries.length === 0 && (
            <p className={styles.emptyMessage}>
              No conditions defined. Add conditions to shade symbol quarters.
              Multiple conditions can share a quarter — distinguish them by
              colour and pattern.
            </p>
          )}

          {identicalGroups.length > 0 && (
            <div className={styles.lookalikeWarning} role="status">
              <p className={styles.lookalikeTitle}>
                {identicalGroups.length === 1
                  ? 'Two conditions look the same'
                  : 'Some conditions look the same'}
              </p>
              {identicalGroups.map((group) => (
                <p key={group[0].id} className={styles.lookalikeText}>
                  {formatNames(group.map((e) => e.name))} have the same quarter,
                  colour and pattern, so they can&rsquo;t be told apart on the
                  chart or in the key. Change the quarter, colour or pattern
                  of one of them.
                </p>
              ))}
            </div>
          )}

          {legendConfig.entries.map((entry) => (
            <LegendEntryRow
              key={entry.id}
              entry={entry}
              looksLikeAnother={lookalikeIds.has(entry.id)}
              onUpdate={(patch) => updateLegendEntry(entry.id, patch)}
              onRemove={() => removeLegendEntry(entry.id)}
            />
          ))}

          <button className={styles.addButton} onClick={handleAdd}>
            + Add Condition
          </button>
        </div>
      </div>
    </div>
  );
}

/** Join names as "A and B" / "A, B and C"; blank names read as "Unnamed". */
function formatNames(names: string[]): string {
  const shown = names.map((n) => n.trim() || 'Unnamed');
  if (shown.length <= 1) return shown.join('');
  return `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
}

interface LegendEntryRowProps {
  entry: LegendEntry;
  /** True when another entry has the same quarter, colour and pattern. */
  looksLikeAnother: boolean;
  onUpdate: (patch: Partial<LegendEntry>) => void;
  onRemove: () => void;
}

function LegendEntryRow({
  entry,
  looksLikeAnother,
  onUpdate,
  onRemove,
}: LegendEntryRowProps) {
  return (
    <div
      className={
        looksLikeAnother
          ? `${styles.entryRow} ${styles.entryRowLookalike}`
          : styles.entryRow
      }
      data-lookalike={looksLikeAnother || undefined}
    >
      <div className={styles.entryFields}>
        <div className={styles.field}>
          <label className={styles.label}>Condition name</label>
          <input
            className={styles.input}
            value={entry.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Breast cancer"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Colour</label>
          <ConditionColorPicker
            value={entry.fillColor}
            onChange={(fillColor) => onUpdate({ fillColor })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Quarter</label>
          <ConditionQuarterGrid
            value={entry.quarter}
            onChange={(quarter) => onUpdate({ quarter })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Pattern</label>
          <ConditionPatternPicker
            value={entry.fillPattern}
            color={entry.fillColor}
            onChange={(fillPattern) => onUpdate({ fillPattern })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Applies to</label>
          <SegmentedControl
            ariaLabel="Applies to"
            options={APPLIES_TO_OPTIONS}
            value={entry.applicableTo ?? 'both'}
            onChange={(v) =>
              onUpdate({
                applicableTo: v === 'both' ? undefined : (v as 'man' | 'woman'),
              })
            }
          />
        </div>
      </div>

      <button
        className={styles.removeButton}
        onClick={onRemove}
        title="Remove condition"
        aria-label="Remove condition"
      >
        &times;
      </button>
    </div>
  );
}
