import { FlowNode, ValidationError } from '../types';

/**
 * BFS traversal from startNodeId → returns ordered array of reachable node IDs
 */
export function bfsTraversal(nodes: Record<string, FlowNode>, startId: string): string[] {
    const visited = new Set<string>();
    const queue: string[] = [startId];
    const result: string[] = [];

    if (!nodes[startId]) return [];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (!visited.has(currentId)) {
            visited.add(currentId);
            result.push(currentId);

            const currentNode = nodes[currentId];
            if (currentNode && currentNode.options) {
                for (const option of currentNode.options) {
                    if (option.targetNodeId && nodes[option.targetNodeId]) {
                        queue.push(option.targetNodeId);
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Find all nodes NOT reachable from startNodeId
 */
export function findOrphanNodes(nodes: Record<string, FlowNode>, startId: string): string[] {
    const reachableIds = new Set(bfsTraversal(nodes, startId));
    return Object.keys(nodes).filter(id => !reachableIds.has(id));
}

/**
 * DFS cycle detection — returns true if a cycle exists
 */
export function hasCycle(nodes: Record<string, FlowNode>, startId: string): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function dfs(nodeId: string): boolean {
        if (recStack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        recStack.add(nodeId);

        const node = nodes[nodeId];
        if (node && node.options) {
            for (const option of node.options) {
                if (dfs(option.targetNodeId)) return true;
            }
        }

        recStack.delete(nodeId);
        return false;
    }

    return dfs(startId);
}

/**
 * Find the shortest path between two node IDs
 */
export function findPath(nodes: Record<string, FlowNode>, fromId: string, toId: string): string[] | null {
    const queue: [string, string[]][] = [[fromId, [fromId]]];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const [currentId, path] = queue.shift()!;
        if (currentId === toId) return path;

        if (!visited.has(currentId)) {
            visited.add(currentId);
            const node = nodes[currentId];
            if (node && node.options) {
                for (const option of node.options) {
                    queue.push([option.targetNodeId, [...path, option.targetNodeId]]);
                }
            }
        }
    }

    return null;
}

/**
 * Get all leaf (end) nodes
 */
export function getLeafNodes(nodes: Record<string, FlowNode>): FlowNode[] {
    return Object.values(nodes).filter(node => node.type === 'end' || node.options.length === 0);
}

/**
 * Validate all option.targetNodeIds exist
 */
export function validateEdgeIntegrity(nodes: Record<string, FlowNode>): ValidationError[] {
    const errors: ValidationError[] = [];

    Object.values(nodes).forEach(node => {
        node.options.forEach((option, index) => {
            if (!nodes[option.targetNodeId]) {
                errors.push({
                    nodeId: node.id,
                    message: `Option "${option.label || index}" points to a non-existent node: ${option.targetNodeId}`,
                    severity: 'error'
                });
            }
        });
    });

    return errors;
}
