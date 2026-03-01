import { z } from 'zod';
import {
    Dimensions,
    TextInput
} from 'react-native';

// ─── Node Types ────────────────────────────────────────────────
export type NodeType = 'start' | 'question' | 'condition' | 'action' | 'end';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe';
export type Priority = 'immediate' | 'urgent' | 'delayed' | 'minimal' | 'expectant';

export interface NodeOption {
    id: string;
    label: string;           // e.g., "Yes", "No", "Severe", "Mild"
    targetNodeId: string;    // ID of the next node
    condition?: string;      // optional display condition text
    color?: string;          // override color for this option button
}

export interface FlowNode {
    id: string;
    type: NodeType;
    title: string;
    description?: string;
    options: NodeOption[];   // outgoing edges (empty for end nodes)
    // End node specific
    riskLevel?: RiskLevel;
    riskScore?: number;      // 0–100
    priority?: Priority;
    recommendedActions?: string[];  // list of action strings
    estimatedTimeMinutes?: number;
    // Metadata
    color?: string;
    icon?: string;
    notes?: string;
    order?: number;          // for list ordering in builder
}

export interface Flowchart {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    tags: string[];
    createdAt: string;       // ISO string
    updatedAt: string;
    startNodeId: string;
    nodes: Record<string, FlowNode>;  // keyed by node ID for O(1) lookup
    isTemplate: boolean;
    isPublished: boolean;
    estimatedMinutes?: number;
}

// ─── Session Types ──────────────────────────────────────────────
export interface SessionStep {
    nodeId: string;
    nodeTitle: string;
    chosenOptionId?: string;
    chosenOptionLabel?: string;
    timestamp: string;
}

export interface TriageSession {
    id: string;
    flowchartId: string;
    flowchartName: string;
    patientId: string;
    startedAt: string;
    completedAt?: string;
    steps: SessionStep[];
    finalRiskLevel?: RiskLevel;
    finalRiskScore?: number;
    finalPriority?: Priority;
    outcome?: string;
    instructions?: string;
    recommendedActions?: string[];
    notes?: string;
    isCompleted: boolean;
}

// ─── Validation ─────────────────────────────────────────────────
export interface ValidationError {
    nodeId?: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

// ─── Store Slices ───────────────────────────────────────────────
export interface FlowchartState {
    flowcharts: Record<string, Flowchart>;
    // History per flowchart ID for undo/redo
    history: Record<string, { past: Flowchart[]; future: Flowchart[] }>;

    createFlowchart: (name: string, description: string, author: string) => string;
    updateFlowchart: (id: string, updates: Partial<Flowchart>) => void;
    deleteFlowchart: (id: string) => void;
    duplicateFlowchart: (id: string, newName: string) => string;
    importFlowchart: (dataOrJson: Flowchart | string) => string;
    exportFlowchart: (id: string) => string;

    addNode: (flowchartId: string, node: Omit<FlowNode, 'id'>) => string;
    updateNode: (flowchartId: string, nodeId: string, updates: Partial<FlowNode>) => void;
    deleteNode: (flowchartId: string, nodeId: string) => void;
    reorderNodes: (flowchartId: string, orderedIds: string[]) => void;

    addOption: (flowchartId: string, nodeId: string, option: Omit<NodeOption, 'id'>) => string;
    updateOption: (flowchartId: string, nodeId: string, optionId: string, updates: Partial<NodeOption>) => void;
    deleteOption: (flowchartId: string, nodeId: string, optionId: string) => void;

    validateFlowchart: (id: string) => ValidationResult;
    undo: (flowchartId: string) => void;
    redo: (flowchartId: string) => void;
    pushHistory: (flowchartId: string) => void;
    loadTemplates: () => void;
}

export interface SessionState {
    sessions: Record<string, TriageSession>;
    activeSessionId: string | null;

    startSession: (flowchartId: string, flowchartName: string, patientId: string) => string;
    advanceSession: (chosenOptionId: string) => void;
    goBackInSession: () => void;
    completeSession: (notes?: string) => void;
    abandonSession: () => void;
    deleteSession: (id: string) => void;

    getActiveSession: () => TriageSession | null;
    getCurrentNode: (flowcharts: Record<string, Flowchart>) => FlowNode | null;
}

// ─── Zod Schemas ───────────────────────────────────────────────
export const NodeOptionSchema = z.object({
    id: z.string(),
    label: z.string().min(1, 'Label is required'),
    targetNodeId: z.string().min(1, 'Target node is required'),
    condition: z.string().optional(),
    color: z.string().optional(),
});

export const FlowNodeSchema = z.object({
    id: z.string(),
    type: z.enum(['start', 'question', 'condition', 'action', 'end']),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    options: z.array(NodeOptionSchema),
    riskLevel: z.enum(['critical', 'high', 'medium', 'low', 'safe']).optional(),
    riskScore: z.number().min(0).max(100).optional(),
    priority: z.enum(['immediate', 'urgent', 'delayed', 'minimal', 'expectant']).optional(),
    recommendedActions: z.array(z.string()).optional(),
    estimatedTimeMinutes: z.number().min(0).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    notes: z.string().optional(),
    order: z.number().optional(),
});

export const FlowchartSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    version: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
    startNodeId: z.string(),
    nodes: z.record(FlowNodeSchema),
    isTemplate: z.boolean(),
    isPublished: z.boolean(),
    estimatedMinutes: z.number().optional(),
});
