import type { TreeNodeData } from '../types';

/**
 * Builds a complete binary tree as a flat array (heap-indexed).
 * - Index 0: nubente (the person getting married)
 * - For node i: father = 2i+1, mother = 2i+2
 * - Generation g occupies indices [2^g - 1 .. 2^(g+1) - 2]
 *
 * @param depth - number of ancestor generations (0 = nubente only)
 * @param side - 'groom' or 'bride' (used for generating unique IDs)
 * @param sharedGen - generation at which couples are shared
 * @param sharedSlots - which couple slots (0-indexed within the generation) are shared.
 *                      e.g. [0, 2] means the 1st and 3rd couple are shared.
 *                      The index within this array = sharedGroupIndex (for color coding).
 */
export function buildTree(
  depth: number,
  side: 'groom' | 'bride',
  sharedGen: number,
  sharedSlots: number[]
): TreeNodeData[] {
  const totalNodes = Math.pow(2, depth + 1) - 1;
  const nodes: TreeNodeData[] = [];

  for (let i = 0; i < totalNodes; i++) {
    const generation = Math.floor(Math.log2(i + 1));
    nodes.push({
      id: `${side}-${i}`,
      generation,
      isShared: false,
      sharedGroupIndex: null,
    });
  }

  if (sharedGen <= depth && sharedSlots.length > 0) {
    const genStart = Math.pow(2, sharedGen) - 1;
    for (let gi = 0; gi < sharedSlots.length; gi++) {
      const coupleSlot = sharedSlots[gi];
      const fatherIdx = genStart + coupleSlot * 2;
      const motherIdx = fatherIdx + 1;
      if (fatherIdx < totalNodes && motherIdx < totalNodes) {
        nodes[fatherIdx].isShared = true;
        nodes[fatherIdx].sharedGroupIndex = gi;
        nodes[motherIdx].isShared = true;
        nodes[motherIdx].sharedGroupIndex = gi;
      }
    }
  }

  return nodes;
}

export function buildTreePair(
  groomDepth: number,
  brideDepth: number,
  groomSlots: number[],
  brideSlots: number[]
): { groomTree: TreeNodeData[]; brideTree: TreeNodeData[] } {
  const groomTree = buildTree(groomDepth, 'groom', groomDepth, groomSlots);
  const brideTree = buildTree(brideDepth, 'bride', brideDepth, brideSlots);
  return { groomTree, brideTree };
}

/** Returns the number of couples at a given generation depth */
export function couplesAtDepth(depth: number): number {
  return Math.pow(2, depth) / 2;
}
