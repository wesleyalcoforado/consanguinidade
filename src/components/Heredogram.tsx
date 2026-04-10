import { useState } from 'react';
import type { TreeNodeData } from '../types';
import { GENERATION_LABELS } from '../config/degrees';

export const SHARED_COLORS: Array<{ bg: string; border: string; text: string }> = [
  { bg: '#ef4444', border: '#b91c1c', text: '#fff' },
  { bg: '#3b82f6', border: '#1d4ed8', text: '#fff' },
  { bg: '#22c55e', border: '#15803d', text: '#fff' },
  { bg: '#f59e0b', border: '#b45309', text: '#fff' },
  { bg: '#a855f7', border: '#7e22ce', text: '#fff' },
  { bg: '#14b8a6', border: '#0f766e', text: '#fff' },
  { bg: '#f97316', border: '#c2410c', text: '#fff' },
];

const NODE_W = 130;
const NODE_H = 48;
const COL_GAP = 52;
const ROW_GAP = 12;
const UNIT_H = NODE_H + ROW_GAP;

const PADDING_TOP = 36;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PADDING_BOTTOM = 8;
const BETWEEN_TREES = 24;

const colX = (gen: number) => PADDING_LEFT + gen * (NODE_W + COL_GAP);

interface NodePosition {
  x: number;
  y: number;
  node: TreeNodeData;
  index: number;
}

function computePositions(
  tree: TreeNodeData[],
  depth: number,
  yOffset: number
): NodePosition[] {
  const leafCount = Math.pow(2, depth);
  const genStart = Math.pow(2, depth) - 1;
  const yCenter: number[] = new Array(tree.length).fill(0);

  for (let i = 0; i < leafCount; i++) {
    const idx = genStart + i;
    if (idx < tree.length) {
      yCenter[idx] = yOffset + i * UNIT_H + NODE_H / 2;
    }
  }
  for (let i = genStart - 1; i >= 0; i--) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < tree.length && r < tree.length) {
      yCenter[i] = (yCenter[l] + yCenter[r]) / 2;
    }
  }

  return tree.map((node, i) => ({
    x: colX(node.generation),
    y: yCenter[i] - NODE_H / 2,
    node,
    index: i,
  }));
}

function coupleSlotOf(nodeId: string, depth: number): number {
  const heapIdx = parseInt(nodeId.split('-')[1]);
  const genStart = Math.pow(2, depth) - 1;
  return Math.floor((heapIdx - genStart) / 2);
}

interface CombinedHeredogramProps {
  groomTree: TreeNodeData[];
  brideTree: TreeNodeData[];
  groomDepth: number;
  brideDepth: number;
  totalDepth: number;
  groomSlots: number[];
  brideSlots: number[];
  groomTotalCouples: number;
  brideTotalCouples: number;
  names: Record<string, string>;
  onNameChange: (id: string, name: string) => void;
  onSwapSlot: (side: 'groom' | 'bride', fromSlot: number, toSlot: number) => void;
}

export function CombinedHeredogram({
  groomTree, brideTree,
  groomDepth, brideDepth, totalDepth,
  groomSlots, brideSlots,
  groomTotalCouples, brideTotalCouples,
  names, onNameChange, onSwapSlot,
}: CombinedHeredogramProps) {
  const [swapMode, setSwapMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ side: 'groom' | 'bride'; coupleSlot: number } | null>(null);

  const groomLeafCount = Math.pow(2, groomDepth);
  const brideLeafCount = Math.pow(2, brideDepth);

  const groomYStart = PADDING_TOP;
  const groomSectionH = groomLeafCount * UNIT_H - ROW_GAP;
  const brideYStart = PADDING_TOP + groomSectionH + BETWEEN_TREES;
  const brideSectionH = brideLeafCount * UNIT_H - ROW_GAP;

  const groomPositions = computePositions(groomTree, groomDepth, groomYStart);
  const bridePositions = computePositions(brideTree, brideDepth, brideYStart);

  const svgWidth = PADDING_LEFT + (totalDepth + 1) * (NODE_W + COL_GAP) - COL_GAP + PADDING_RIGHT;
  const svgHeight = PADDING_TOP + groomSectionH + BETWEEN_TREES + brideSectionH + PADDING_BOTTOM;
  const dividerY = PADDING_TOP + groomSectionH + BETWEEN_TREES / 2;

  // Only show swap affordance when there are multiple couples at the shared gen
  const groomCanSwap = groomTotalCouples > groomSlots.length;
  const brideCanSwap = brideTotalCouples > brideSlots.length;
  const canSwap = groomCanSwap || brideCanSwap;

  function exitSwapMode() {
    setSwapMode(false);
    setSelectedNode(null);
  }

  function handleNodeClick(side: 'groom' | 'bride', node: TreeNodeData, depth: number) {
    if (!swapMode) return;
    if (node.generation !== depth) return;

    const coupleSlot = coupleSlotOf(node.id, depth);
    const slots = side === 'groom' ? groomSlots : brideSlots;

    if (node.isShared) {
      if (selectedNode?.side === side && selectedNode.coupleSlot === coupleSlot) {
        setSelectedNode(null);
      } else {
        setSelectedNode({ side, coupleSlot });
      }
    } else {
      if (selectedNode && selectedNode.side === side && !slots.includes(coupleSlot)) {
        onSwapSlot(side, selectedNode.coupleSlot, coupleSlot);
        setSelectedNode(null);
      }
    }
  }

  function renderTree(
    positions: NodePosition[],
    side: 'groom' | 'bride',
    depth: number,
  ) {
    const slots = side === 'groom' ? groomSlots : brideSlots;

    return (
      <>
        {/* Connector lines */}
        {positions.map(({ x, y, index, node }) => {
          if (node.generation === 0) return null;
          const parentIdx = Math.floor((index - 1) / 2);
          const parentPos = positions.find(p => p.index === parentIdx);
          if (!parentPos) return null;

          const parentRX = parentPos.x + NODE_W;
          const childLX = x;
          const midX = (parentRX + childLX) / 2;
          const parentCY = parentPos.y + NODE_H / 2;
          const nodeCY = y + NODE_H / 2;

          return (
            <g key={`line-${node.id}`}>
              <line x1={parentRX} y1={parentCY} x2={midX} y2={parentCY} stroke="hsl(36, 20%, 72%)" strokeWidth={1.5} />
              <line x1={midX} y1={parentCY} x2={midX} y2={nodeCY} stroke="hsl(36, 20%, 72%)" strokeWidth={1.5} />
              <line x1={midX} y1={nodeCY} x2={childLX} y2={nodeCY} stroke="hsl(36, 20%, 72%)" strokeWidth={1.5} />
            </g>
          );
        })}

        {/* Nodes */}
        {positions.map(({ x, y, node }) => {
          const isShared = node.isShared;
          const colorInfo = isShared && node.sharedGroupIndex !== null
            ? SHARED_COLORS[node.sharedGroupIndex]
            : null;

          const isAtSharedGen = node.generation === depth;
          const coupleSlot = isAtSharedGen ? coupleSlotOf(node.id, depth) : -1;
          const isSelected = swapMode && selectedNode?.side === side && selectedNode.coupleSlot === coupleSlot;
          const isSwapTarget = swapMode && selectedNode?.side === side && isAtSharedGen && !isShared && !slots.includes(coupleSlot);
          const isClickable = swapMode && isAtSharedGen && (isShared || isSwapTarget);

          const bgColor = colorInfo
            ? colorInfo.bg
            : isSwapTarget ? 'hsl(40, 69%, 90%)' : 'hsl(40, 69%, 97%)';
          const borderColor = colorInfo
            ? colorInfo.border
            : isSwapTarget ? 'hsl(36, 20%, 60%)' : 'hsl(36, 20%, 80%)';
          const textColor = colorInfo ? colorInfo.text : 'hsl(35, 33%, 17%)';
          const name = names[node.id] ?? '';
          const nodeLabel = node.generation === 0 ? 'Nubente' : GENERATION_LABELS[node.generation];

          return (
            <g
              key={node.id}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
              onClick={isClickable ? () => handleNodeClick(side, node, depth) : undefined}
            >
              {isSelected && (
                <rect x={x - 3} y={y - 3} width={NODE_W + 6} height={NODE_H + 6} rx={10}
                  fill="none" stroke="hsl(168, 21%, 33%)" strokeWidth={2.5} strokeDasharray="5 3" />
              )}
              <rect x={x + 2} y={y + 2} width={NODE_W} height={NODE_H} rx={8} fill="rgba(0,0,0,0.07)" />
              <rect
                x={x} y={y} width={NODE_W} height={NODE_H} rx={8}
                fill={bgColor} stroke={borderColor}
                strokeWidth={isShared || isSelected ? 2 : 1}
              />
              <text
                x={x + NODE_W / 2} y={y + 12}
                textAnchor="middle" fontSize={9}
                fill={colorInfo ? 'rgba(255,255,255,0.75)' : 'hsl(36, 20%, 60%)'}
                fontFamily="'Open Sans', system-ui, sans-serif"
              >
                {nodeLabel}
              </text>
              <foreignObject x={x + 4} y={y + 16} width={NODE_W - 8} height={NODE_H - 20}>
                <input
                  style={{
                    width: '100%', height: '100%',
                    border: 'none', background: 'transparent',
                    fontSize: 11, fontFamily: "'Open Sans', system-ui, sans-serif",
                    color: textColor, textAlign: 'center',
                    outline: 'none', padding: '0 2px',
                    boxSizing: 'border-box',
                    cursor: isClickable ? 'pointer' : 'text',
                    pointerEvents: swapMode ? 'none' : 'auto',
                  }}
                  value={name}
                  onChange={e => onNameChange(node.id, e.target.value)}
                  placeholder="Nome..."
                />
              </foreignObject>
            </g>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Swap mode toolbar */}
      {canSwap && (
        <div className="flex items-center gap-3">
          {!swapMode ? (
            <button
              onClick={() => setSwapMode(true)}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--bg-dark)', color: 'var(--on-bg-dark)', border: '1px solid var(--border)' }}
            >
              ⇄ Mover casais compartilhados
            </button>
          ) : (
            <>
              <span className="text-xs rounded-lg px-3 py-1.5" style={{ background: 'var(--bg-dark)', color: 'var(--on-bg-dark)', border: '1px solid var(--border)' }}>
                {selectedNode
                  ? 'Clique num nó cinza para mover o casal para lá'
                  : 'Clique num nó colorido para selecioná-lo'}
              </span>
              <button
                onClick={exitSwapMode}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: '1px solid var(--primary-active)' }}
              >
                Concluir
              </button>
            </>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
          style={{ minWidth: svgWidth }}
        >
          {Array.from({ length: totalDepth + 1 }, (_, gen) => (
            <text
              key={`col-label-${gen}`}
              x={colX(gen) + NODE_W / 2}
              y={PADDING_TOP - 8}
              textAnchor="middle" fontSize={10}
              fill="hsl(36, 20%, 60%)" fontFamily="'Open Sans', system-ui, sans-serif"
            >
              {gen === 0 ? 'Nubentes' : GENERATION_LABELS[gen]}
            </text>
          ))}

          <line
            x1={PADDING_LEFT} y1={dividerY}
            x2={svgWidth - PADDING_RIGHT} y2={dividerY}
            stroke="hsl(36, 20%, 72%)" strokeWidth={1} strokeDasharray="4 4"
          />

          {renderTree(groomPositions, 'groom', groomDepth)}
          {renderTree(bridePositions, 'bride', brideDepth)}
        </svg>
      </div>
    </div>
  );
}
