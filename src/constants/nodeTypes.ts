import { NodeType } from '../types';

export interface NodeTypeConfig {
    type: NodeType;
    label: string;
    icon: string;
    colorKey: string;
    description: string;
}

export const NODE_TYPES: Record<NodeType, NodeTypeConfig> = {
    start: {
        type: 'start',
        label: 'Start Node',
        icon: 'play-circle',
        colorKey: 'start',
        description: 'The beginning of the protocol. Exactly one required.'
    },
    question: {
        type: 'question',
        label: 'Question',
        icon: 'help-circle',
        colorKey: 'question',
        description: 'Ask the user a question with multiple defined answers.'
    },
    condition: {
        type: 'condition',
        label: 'Condition',
        icon: 'call-split',
        colorKey: 'condition',
        description: 'Branch based on a logical condition or vital sign check.'
    },
    action: {
        type: 'action',
        label: 'Action Step',
        icon: 'format-list-checks',
        colorKey: 'action',
        description: 'Instruct the user to perform a specific medical action.'
    },
    end: {
        type: 'end',
        label: 'Outcome',
        icon: 'flag-checkered',
        colorKey: 'end',
        description: 'The final result, risk level, and disposition.'
    }
};
