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
 * @param multiplicity - how many couples at sharedGen are shared
 * @param sharedOffset - start index (within the generation) of shared couples
 */
export function buildTree(
  depth: number,
  side: 'groom' | 'bride',
  sharedGen: number,
  multiplicity: number,
  sharedOffset: number = 0
): TreeNodeData[] {
  const totalNodes = Math.pow(2, depth + 1) - 1;
  const nodes: TreeNodeData[] = [];

  for (let i = 0; i < totalNodes; i++) {
    // Determine which generation this node belongs to
    const generation = Math.floor(Math.log2(i + 1));

    nodes.push({
      id: `${side}-${i}`,
      generation,
      isShared: false,
      sharedGroupIndex: null,
    });
  }

  // Mark shared couples at the shared generation
  if (sharedGen <= depth && multiplicity > 0) {
    const genStart = Math.pow(2, sharedGen) - 1; // first index of sharedGen
    // Couples at generation g: (genStart, genStart+1), (genStart+2, genStart+3), ...
    // Each couple = two siblings in the tree = children of the same parent node
    // Couple k = nodes at indices genStart + 2k and genStart + 2k + 1
    for (let coupleIdx = 0; coupleIdx < multiplicity; coupleIdx++) {
      const fatherIdx = genStart + (sharedOffset + coupleIdx) * 2;
      const motherIdx = fatherIdx + 1;
      if (fatherIdx < totalNodes && motherIdx < totalNodes) {
        nodes[fatherIdx].isShared = true;
        nodes[fatherIdx].sharedGroupIndex = coupleIdx;
        nodes[motherIdx].isShared = true;
        nodes[motherIdx].sharedGroupIndex = coupleIdx;
      }
    }
  }

  return nodes;
}

/**
 * For atingente degrees, the two trees have different depths.
 * We use the same sharedGroupIndex scheme but different shared generations.
 */
export function buildTreePair(
  groomDepth: number,
  brideDepth: number,
  multiplicity: number
): { groomTree: TreeNodeData[]; brideTree: TreeNodeData[] } {
  // For equal degrees: both trees share at their common deepest generation
  // For atingente: groom shares at groomDepth, bride shares at brideDepth
  const groomTree = buildTree(groomDepth, 'groom', groomDepth, multiplicity);
  const brideTree = buildTree(brideDepth, 'bride', brideDepth, multiplicity);
  return { groomTree, brideTree };
}

/** Returns nodes at a specific generation from a tree array */
export function getNodesAtGeneration(tree: TreeNodeData[], generation: number): TreeNodeData[] {
  return tree.filter(n => n.generation === generation);
}

/** Returns the parent index of a node */
export function parentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

/** Returns child indices of a node */
export function childIndices(i: number): [number, number] {
  return [2 * i + 1, 2 * i + 2];
}
