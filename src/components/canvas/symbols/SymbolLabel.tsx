import React, { useMemo } from 'react';
import { Group, Text } from 'react-konva';
import type { Individual, LegendEntry } from '../../../types/pedigree';
import { buildSymbolLabelLines } from '../../../utils/symbolLabelLines';
import {
  SYMBOL_SIZE,
  LABEL_FONT_SIZE,
  LABEL_FONT_FAMILY,
  LABEL_COLOR,
  LABEL_OFFSET_Y,
  ADOPTION_BRACKET_GAP,
} from '../../../utils/constants';
import { CHILDLESS_LABEL_OFFSET } from '../../../utils/childlessness';

export interface SymbolLabelProps {
  individual: Individual;
  individualNumber?: number;
  /**
   * True when this individual's childless marks are drawn below the symbol. The
   * label block is then pushed down to clear the stub + cross-bar(s), and the
   * childless cause (if any) is folded in as the first line so it reads as part
   * of the marks. Owned by the parent, which knows whether the marks are
   * suppressed by children — see {@link childlessMarksActive}.
   */
  childlessActive?: boolean;
  /**
   * The document's legend entries, so a condition assigned with an age at
   * onset can be drawn as `"<name> (dx <age>)"`. Passed down from
   * `CanvasContainer` (subscriptions can't live inside react-konva).
   */
  legendEntries?: readonly LegendEntry[];
}

const NO_ENTRIES: readonly LegendEntry[] = [];

const LINE_HEIGHT = LABEL_FONT_SIZE + 4;

/**
 * Horizontal gap between the symbol's right edge (or the adoption bracket's
 * right arm, when the individual is adopted) and the start of the bottom-right
 * individual number, so the digits never touch the outline or clip against the
 * bracket.
 */
const NUMBER_CORNER_GAP = 3;

/**
 * X of the bottom-right individual number's left edge. Normally just outside
 * the symbol's bounding box; when the individual is adopted the number is
 * shifted past the adoption bracket's right vertical stroke so the bracket
 * arm cannot occlude the digits (see issue #152).
 */
function numberCornerX(adopted: boolean): number {
  const base = adopted ? ADOPTION_BRACKET_GAP : SYMBOL_SIZE / 2;
  return base + NUMBER_CORNER_GAP;
}

export const SymbolLabel: React.FC<SymbolLabelProps> = React.memo(
  ({ individual, individualNumber, childlessActive = false, legendEntries = NO_ENTRIES }) => {
    // Shared with svgExport.ts so canvas and vector export never drift.
    const lines = useMemo(
      () => buildSymbolLabelLines(individual, legendEntries, childlessActive),
      [individual, legendEntries, childlessActive],
    );

    if (lines.length === 0 && individualNumber == null) {
      return null;
    }

    const half = SYMBOL_SIZE / 2;
    // Push the whole stack below the childless marks when they are drawn.
    const startY =
      half + LABEL_OFFSET_Y + (childlessActive ? CHILDLESS_LABEL_OFFSET : 0);

    return (
      <Group>
        {/* Individual number at the symbol's bottom-right corner (pedigree
            convention). Left-anchored just outside the shape's bounding box so
            it reads as sitting at the corner without overlapping the outline. */}
        {individualNumber != null && (
          <Text
            text={`${individualNumber}`}
            x={numberCornerX(individual.adopted ?? false)}
            y={half - LABEL_FONT_SIZE / 2}
            fontSize={LABEL_FONT_SIZE}
            fontFamily={LABEL_FONT_FAMILY}
            fill={LABEL_COLOR}
          />
        )}

        {/* Name / age / conditions stack, centred below the symbol. */}
        {lines.map((line, index) => (
          <Text
            key={index}
            text={line}
            y={startY + index * LINE_HEIGHT}
            fontSize={LABEL_FONT_SIZE}
            fontFamily={LABEL_FONT_FAMILY}
            fill={LABEL_COLOR}
            align="center"
            width={200}
            x={-100}
          />
        ))}
      </Group>
    );
  }
);

SymbolLabel.displayName = 'SymbolLabel';
