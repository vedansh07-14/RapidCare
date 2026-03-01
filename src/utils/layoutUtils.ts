import { FlowNode } from '../types';

/**
 * Top-down hierarchical layout using BFS level assignment
 * Returns Record<nodeId, {x: number, y: number}>
 * Nodes at same depth are distributed horizontally with equal spacing
 * Used by FlowchartPreview SVG renderer
 */
export function computeLayout(
    nodes: Record<string, FlowNode>,
    startId: string,
    nodeWidth = 60,
    nodeHeight = 60,
    hGap = 40,
    vGap = 80
): Record<string, { x: number; y: number }> {
    const layout: Record<string, { x: number; y: number }> = {};
    const levels: Record<number, string[]> = {};
    const visited = new Set<string>();
    const queue: [string, number][] = [[startId, 0]];

    if (!nodes[startId]) return {};

    // Group nodes by BFS depth (level)
    while (queue.length > 0) {
        const [id, level] = queue.shift()!;
        if (!visited.has(id)) {
            visited.add(id);
            if (!levels[level]) levels[level] = [];
            levels[level].push(id);

            const node = nodes[id];
            if (node && node.options) {
                for (const option of node.options) {
                    if (nodes[option.targetNodeId]) {
                        queue.push([option.targetNodeId, level + 1]);
                    }
                }
            }
        }
    }

    // Calculate coordinates based on levels
    Object.keys(levels).forEach(levelStr => {
        const level = parseInt(levelStr, 10);
        const nodesAtLevel = levels[level];
        const totalWidth = nodesAtLevel.length * nodeWidth + (nodesAtLevel.length - 1) * hGap;
        const startX = -totalWidth / 2;

        nodesAtLevel.forEach((id, index) => {
            layout[id] = {
                x: startX + index * (nodeWidth + hGap) + nodeWidth / 2,
                y: level * (nodeHeight + vGap) + nodeHeight / 2,
            };
        });
    });

    return layout;
}
