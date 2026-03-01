import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
    Flowchart,
    FlowNode,
    NodeOption,
    FlowchartState,
    ValidationResult,
    ValidationError
} from '../types';
import { TEMPLATES } from '../constants/templates';
import {
    bfsTraversal,
    findOrphanNodes,
    hasCycle,
    validateEdgeIntegrity
} from '../utils/graphUtils';

const MAX_HISTORY = 20;

export const useFlowchartStore = create<FlowchartState>()(
    persist(
        (set, get) => ({
            flowcharts: {},
            history: {},

            createFlowchart: (name, description, author) => {
                const id = uuidv4();
                const startNodeId = uuidv4();

                const newFlowchart: Flowchart = {
                    id,
                    name,
                    description,
                    version: '1.0.0',
                    author,
                    tags: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    startNodeId,
                    isTemplate: false,
                    isPublished: false,
                    nodes: {
                        [startNodeId]: {
                            id: startNodeId,
                            type: 'start',
                            title: 'Start Node',
                            description: 'Begin your assessment here.',
                            options: [],
                            order: 0,
                        }
                    }
                };

                set(state => ({
                    flowcharts: { ...state.flowcharts, [id]: newFlowchart }
                }));

                return id;
            },

            updateFlowchart: (id, updates) => {
                get().pushHistory(id);
                set(state => ({
                    flowcharts: {
                        ...state.flowcharts,
                        [id]: {
                            ...state.flowcharts[id],
                            ...updates,
                            updatedAt: new Date().toISOString()
                        }
                    }
                }));
            },

            deleteFlowchart: (id) => {
                set(state => {
                    const { [id]: _, ...remaining } = state.flowcharts;
                    const { [id]: __, ...remainingHistory } = state.history;
                    return { flowcharts: remaining, history: remainingHistory };
                });
            },

            duplicateFlowchart: (id, newName) => {
                const source = get().flowcharts[id];
                if (!source) return '';

                const newId = uuidv4();
                const duplicated: Flowchart = {
                    ...source,
                    id: newId,
                    name: newName,
                    isTemplate: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                set(state => ({
                    flowcharts: { ...state.flowcharts, [newId]: duplicated }
                }));

                return newId;
            },

            importFlowchart: (dataOrJson) => {
                try {
                    const data = typeof dataOrJson === 'string'
                        ? JSON.parse(dataOrJson) as Flowchart
                        : dataOrJson;

                    if (!data.id || !data.nodes) throw new Error('Invalid flowchart data');

                    // If it's a template being imported, give it a new ID
                    const newId = uuidv4();
                    const imported: Flowchart = {
                        ...data,
                        id: newId,
                        isTemplate: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    set(state => ({
                        flowcharts: { ...state.flowcharts, [newId]: imported }
                    }));
                    return newId;
                } catch (error) {
                    console.error('Import failed', error);
                    return '';
                }
            },

            exportFlowchart: (id) => {
                const flowchart = get().flowcharts[id];
                return JSON.stringify(flowchart, null, 2);
            },

            addNode: (flowchartId, nodeData) => {
                get().pushHistory(flowchartId);
                const nodeId = uuidv4();
                const newNode: FlowNode = {
                    ...nodeData,
                    id: nodeId,
                    options: nodeData.options || []
                };

                set(state => {
                    const flowchart = state.flowcharts[flowchartId];
                    return {
                        flowcharts: {
                            ...state.flowcharts,
                            [flowchartId]: {
                                ...flowchart,
                                nodes: { ...flowchart.nodes, [nodeId]: newNode },
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });

                return nodeId;
            },

            updateNode: (flowchartId, nodeId, updates) => {
                get().pushHistory(flowchartId);
                set(state => {
                    const flowchart = state.flowcharts[flowchartId];
                    const node = flowchart.nodes[nodeId];
                    return {
                        flowcharts: {
                            ...state.flowcharts,
                            [flowchartId]: {
                                ...flowchart,
                                nodes: {
                                    ...flowchart.nodes,
                                    [nodeId]: { ...node, ...updates }
                                },
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });
            },

            deleteNode: (flowchartId, nodeId) => {
                get().pushHistory(flowchartId);
                set(state => {
                    const flowchart = state.flowcharts[flowchartId];
                    const nodeToDelete = flowchart.nodes[nodeId];

                    if (nodeToDelete?.type === 'start') {
                        // Don't allow deleting the only start node
                        const otherStartNode = Object.values(flowchart.nodes).find(n => n.id !== nodeId && n.type === 'start');
                        if (!otherStartNode) {
                            return state; // Silently fail or handled by UI
                        }
                    }

                    const { [nodeId]: _, ...remainingNodes } = flowchart.nodes;

                    // Also remove any options pointing to this node
                    const updatedNodes: Record<string, FlowNode> = {};
                    Object.keys(remainingNodes).forEach(key => {
                        const node = remainingNodes[key];
                        updatedNodes[key] = {
                            ...node,
                            options: node.options.filter(opt => opt.targetNodeId !== nodeId)
                        };
                    });

                    return {
                        flowcharts: {
                            ...state.flowcharts,
                            [flowchartId]: {
                                ...flowchart,
                                nodes: updatedNodes,
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });
            },

            reorderNodes: (flowchartId, orderedIds) => {
                get().pushHistory(flowchartId);
                set(state => {
                    const flowchart = state.flowcharts[flowchartId];
                    const updatedNodes = { ...flowchart.nodes };

                    orderedIds.forEach((id, index) => {
                        if (updatedNodes[id]) {
                            updatedNodes[id] = { ...updatedNodes[id], order: index };
                        }
                    });

                    return {
                        flowcharts: {
                            ...state.flowcharts,
                            [flowchartId]: {
                                ...flowchart,
                                nodes: updatedNodes,
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });
            },

            addOption: (flowchartId, nodeId, optionData) => {
                get().pushHistory(flowchartId);
                const optionId = uuidv4();
                const newOption: NodeOption = { ...optionData, id: optionId };

                set(state => {
                    const flowchart = state.flowcharts[flowchartId];
                    const node = flowchart.nodes[nodeId];
                    return {
                        flowcharts: {
                            ...state.flowcharts,
                            [flowchartId]: {
                                ...flowchart,
                                nodes: {
                                    ...flowchart.nodes,
                                    [nodeId]: {
                                        ...node,
                                        options: [...node.options, newOption]
                                    }
                                },
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });

                return optionId;
            },

            updateOption: (flowchartId, nodeId, optionId, updates) => {
                get().pushHistory(flowchartId);
                set(state => {
                    const flowchart = state.flowcharts[flowchartId];
                    const node = flowchart.nodes[nodeId];
                    const updatedOptions = node.options.map(opt =>
                        opt.id === optionId ? { ...opt, ...updates } : opt
                    );

                    return {
                        flowcharts: {
                            ...state.flowcharts,
                            [flowchartId]: {
                                ...flowchart,
                                nodes: {
                                    ...flowchart.nodes,
                                    [nodeId]: { ...node, options: updatedOptions }
                                },
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });
            },

            deleteOption: (flowchartId, nodeId, optionId) => {
                get().pushHistory(flowchartId);
                set(state => {
                    const flowchart = state.flowcharts[flowchartId];
                    const node = flowchart.nodes[nodeId];
                    const updatedOptions = node.options.filter(opt => opt.id !== optionId);

                    return {
                        flowcharts: {
                            ...state.flowcharts,
                            [flowchartId]: {
                                ...flowchart,
                                nodes: {
                                    ...flowchart.nodes,
                                    [nodeId]: { ...node, options: updatedOptions }
                                },
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });
            },

            validateFlowchart: (id) => {
                const flowchart = get().flowcharts[id];
                if (!flowchart) return { isValid: false, errors: [], warnings: [] };

                const errors: ValidationError[] = [];
                const warnings: ValidationError[] = [];

                const nodes = flowchart.nodes;
                const nodeValues = Object.values(nodes);

                // 1. Exactly one start node
                const startNodes = nodeValues.filter(n => n.type === 'start');
                if (startNodes.length === 0) {
                    errors.push({ message: 'No start node defined', severity: 'error' });
                } else if (startNodes.length > 1) {
                    errors.push({ message: 'Multiple start nodes defined', severity: 'error' });
                }

                // 2. All non-end nodes have at least one option
                nodeValues.forEach(node => {
                    if (node.type !== 'end' && node.options.length === 0) {
                        errors.push({
                            nodeId: node.id,
                            message: `Node "${node.title}" has no outgoing options`,
                            severity: 'error'
                        });
                    }
                });

                // 3. Edge integrity
                errors.push(...validateEdgeIntegrity(nodes));

                // 4. End node properties
                nodeValues.forEach(node => {
                    if (node.type === 'end') {
                        if (!node.riskLevel) {
                            errors.push({
                                nodeId: node.id,
                                message: `Outcome "${node.title}" is missing risk level`,
                                severity: 'error'
                            });
                        }
                    }
                });

                // 5. Orphan nodes
                if (startNodes.length === 1) {
                    const orphans = findOrphanNodes(nodes, startNodes[0].id);
                    orphans.forEach(nodeId => {
                        warnings.push({
                            nodeId,
                            message: `Node "${nodes[nodeId].title}" is unreachable from start`,
                            severity: 'warning'
                        });
                    });
                }

                // 6. Cycle detection
                if (startNodes.length === 1 && hasCycle(nodes, startNodes[0].id)) {
                    warnings.push({ message: 'Circular path detected in protocol', severity: 'warning' });
                }

                return {
                    isValid: errors.length === 0,
                    errors,
                    warnings
                };
            },

            pushHistory: (flowchartId) => {
                const flowchart = get().flowcharts[flowchartId];
                if (!flowchart) return;

                set(state => {
                    const flowchartHistory = state.history[flowchartId] || { past: [], future: [] };
                    const newPast = [flowchart, ...flowchartHistory.past].slice(0, MAX_HISTORY);

                    return {
                        history: {
                            ...state.history,
                            [flowchartId]: { past: newPast, future: [] }
                        }
                    };
                });
            },

            undo: (flowchartId) => {
                const flowchartHistory = get().history[flowchartId];
                if (!flowchartHistory || flowchartHistory.past.length === 0) return;

                set(state => {
                    const current = state.flowcharts[flowchartId];
                    const past = [...state.history[flowchartId].past];
                    const future = [...state.history[flowchartId].future];

                    const previous = past.shift()!;
                    const newFuture = [current, ...future].slice(0, MAX_HISTORY);

                    return {
                        flowcharts: { ...state.flowcharts, [flowchartId]: previous },
                        history: {
                            ...state.history,
                            [flowchartId]: { past, future: newFuture }
                        }
                    };
                });
            },

            redo: (flowchartId) => {
                const flowchartHistory = get().history[flowchartId];
                if (!flowchartHistory || flowchartHistory.future.length === 0) return;

                set(state => {
                    const current = state.flowcharts[flowchartId];
                    const past = [...state.history[flowchartId].past];
                    const future = [...state.history[flowchartId].future];

                    const next = future.shift()!;
                    const newPast = [current, ...past].slice(0, MAX_HISTORY);

                    return {
                        flowcharts: { ...state.flowcharts, [flowchartId]: next },
                        history: {
                            ...state.history,
                            [flowchartId]: { past: newPast, future }
                        }
                    };
                });
            },

            loadTemplates: () => {
                set(state => {
                    const updatedFlowcharts = { ...state.flowcharts };
                    TEMPLATES.forEach(template => {
                        if (!updatedFlowcharts[template.id]) {
                            updatedFlowcharts[template.id] = template;
                        }
                    });
                    return { flowcharts: updatedFlowcharts };
                });
            },
        }),
        {
            name: 'triage-flowcharts',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
