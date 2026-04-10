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
const NODE_H = 52;
const H_GAP = 16;
const V_GAP = 64;
const PADDING_TOP = 40;
const PADDING_LEFT = 48; // space for generation labels
const PADDING_RIGHT = 8;
const PADDING_BOTTOM = 8;

interface NodePosition {
  x: number;
  y: number;
  node: TreeNodeData;
  index: number;
}

function computeLayout(
  tree: TreeNodeData[],
  maxDepth: number,
  totalDepth: number // the deepest depth across both trees (for alignment)
): NodePosition[] {
  const positions: NodePosition[] = [];

  // Bottom of chart = nubente row, top = deepest generation
  // Row for generation g (0 = nubente = bottom):
  //   y = PADDING_TOP + (totalDepth - g) * (NODE_H + V_GAP)
  const rowY = (gen: number) =>
    PADDING_TOP + (totalDepth - gen) * (NODE_H + V_GAP);

  // Width of the bottom-most generation of this tree
  const leafCount = Math.pow(2, maxDepth);
  const unitW = NODE_W + H_GAP;
  const treeWidth = leafCount * unitW - H_GAP;

  // Assign x positions top-down via recursive centering
  // For each node, its x-center = average of its two children's x-centers
  // Leaves are spaced evenly
  const xCenter: number[] = new Array(tree.length).fill(0);

  // Place leaf nodes (deepest generation)
  const genStart = Math.pow(2, maxDepth) - 1;
  for (let i = 0; i < leafCount; i++) {
    const nodeIdx = genStart + i;
    if (nodeIdx < tree.length) {
      xCenter[nodeIdx] = PADDING_LEFT + i * unitW + NODE_W / 2;
    }
  }

  // Work up from deepest to shallowest
  for (let i = genStart - 1; i >= 0; i--) {
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;
    if (leftChild < tree.length && rightChild < tree.length) {
      xCenter[i] = (xCenter[leftChild] + xCenter[rightChild]) / 2;
    }
  }

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    positions.push({
      x: xCenter[i] - NODE_W / 2,
      y: rowY(node.generation),
      node,
      index: i,
    });
  }

  const svgWidth = PADDING_LEFT + treeWidth + PADDING_RIGHT;
  const svgHeight = PADDING_TOP + (totalDepth + 1) * (NODE_H + V_GAP) - V_GAP + PADDING_BOTTOM;

  // Attach to positions array as metadata (hack to avoid extra return value)
  (positions as any).__svgWidth = svgWidth;
  (positions as any).__svgHeight = svgHeight;

  return positions;
}

interface HeredogramProps {
  tree: TreeNodeData[];
  depth: number;
  totalDepth: number; // max depth across both trees
  label: string; // "Noivo" or "Noiva"
  names: Record<string, string>;
  onNameChange: (id: string, name: string) => void;
}

export function Heredogram({ tree, depth, totalDepth, label, names, onNameChange }: HeredogramProps) {
  const positions = computeLayout(tree, depth, totalDepth);
  const svgWidth = (positions as any).__svgWidth as number;
  const svgHeight = (positions as any).__svgHeight as number;

  // Row Y for generation labels
  const rowY = (gen: number) =>
    PADDING_TOP + (totalDepth - gen) * (NODE_H + V_GAP);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
          style={{ minWidth: svgWidth }}
        >
          {/* Generation labels on the left */}
          {Array.from({ length: depth + 1 }, (_, gen) => (
            <text
              key={`gen-label-${gen}`}
              x={PADDING_LEFT - 6}
              y={rowY(gen) + NODE_H / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill="#9ca3af"
              fontFamily="system-ui, sans-serif"
            >
              {GENERATION_LABELS[gen]}
            </text>
          ))}

          {/* Connector lines (bracket style) */}
          {positions.map(({ x, y, index, node }) => {
            if (node.generation === 0) return null;
            const parentIdx = Math.floor((index - 1) / 2);
            const parentPos = positions.find(p => p.index === parentIdx);
            if (!parentPos) return null;

            const childCX = parentPos.x + NODE_W / 2;
            const childCY = parentPos.y + NODE_H;
            const nodeCX = x + NODE_W / 2;
            const nodeCY = y; // top of node
            const midY = (childCY + nodeCY) / 2;

            return (
              <g key={`line-${index}`}>
                {/* Vertical from parent bottom down to midpoint */}
                <line x1={childCX} y1={childCY} x2={childCX} y2={midY} stroke="#d1d5db" strokeWidth={1.5} />
                {/* Horizontal from parent center to node center */}
                <line x1={childCX} y1={midY} x2={nodeCX} y2={midY} stroke="#d1d5db" strokeWidth={1.5} />
                {/* Vertical from midpoint to node top */}
                <line x1={nodeCX} y1={midY} x2={nodeCX} y2={nodeCY} stroke="#d1d5db" strokeWidth={1.5} />
              </g>
            );
          })}

          {/* Nodes */}
          {positions.map(({ x, y, node }) => {
            const isShared = node.isShared;
            const colorInfo = isShared && node.sharedGroupIndex !== null
              ? SHARED_COLORS[node.sharedGroupIndex]
              : null;
            const bgColor = colorInfo ? colorInfo.bg : '#f9fafb';
            const borderColor = colorInfo ? colorInfo.border : '#e5e7eb';
            const textColor = colorInfo ? colorInfo.text : '#374151';
            const name = names[node.id] ?? '';

            return (
              <g key={node.id}>
                {/* Drop shadow via filter rect */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill="rgba(0,0,0,0.07)"
                />
                {/* Node background */}
                <rect
                  x={x}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth={isShared ? 2 : 1}
                />
                {/* Generation label inside node (top) */}
                <text
                  x={x + NODE_W / 2}
                  y={y + 13}
                  textAnchor="middle"
                  fontSize={9}
                  fill={colorInfo ? 'rgba(255,255,255,0.75)' : '#9ca3af'}
                  fontFamily="system-ui, sans-serif"
                >
                  {GENERATION_LABELS[node.generation]}
                </text>
                {/* Editable name via foreignObject */}
                <foreignObject x={x + 4} y={y + 18} width={NODE_W - 8} height={NODE_H - 22}>
                  <input
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      fontSize: 11,
                      fontFamily: 'system-ui, sans-serif',
                      color: textColor,
                      textAlign: 'center',
                      outline: 'none',
                      padding: '0 2px',
                      boxSizing: 'border-box',
                      cursor: 'text',
                    }}
                    value={name}
                    onChange={e => onNameChange(node.id, e.target.value)}
                    placeholder="Nome..."
                  />
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
