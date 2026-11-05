import React from 'react';
import { Line } from 'react-konva';
import type { Individual } from '../../types/pedigree';
import { LINK_SOURCE_COLOR } from '../../utils/constants';

interface DragLinkLayerProps {
  active: boolean;
  sourceId: string | null;
  cursorPos: { x: number; y: number };
  individuals: Record<string, Individual>;
}

export const DragLinkLayer: React.FC<DragLinkLayerProps> = React.memo(
  ({ active, sourceId, cursorPos, individuals }) => {
    if (!active || !sourceId) return null;

    const source = individuals[sourceId];
    if (!source) return null;

    return (
      <Line
        points={[source.position.x, source.position.y, cursorPos.x, cursorPos.y]}
        stroke={LINK_SOURCE_COLOR}
        strokeWidth={2}
        dash={[8, 4]}
        listening={false}
      />
    );
  },
);

DragLinkLayer.displayName = 'DragLinkLayer';
