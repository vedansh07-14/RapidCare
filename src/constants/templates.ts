import { Flowchart } from '../types';

export const TEMPLATES: Flowchart[] = [
    {
        id: 'template-chest-pain',
        name: 'Chest Pain Triage Protocol',
        description: 'Rapid assessment for suspected acute coronary syndrome (ACS).',
        version: '1.0.0',
        author: 'TriageFlow Medical Board',
        tags: ['Cardiac', 'Emergency', 'ACS'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startNodeId: 'node-1',
        isTemplate: true,
        isPublished: true,
        estimatedMinutes: 5,
        nodes: {
            'node-1': {
                id: 'node-1',
                type: 'start',
                title: 'Is the patient conscious and responsive?',
                options: [
                    { id: 'opt-1-1', label: 'Yes', targetNodeId: 'node-2' },
                    { id: 'opt-1-2', label: 'No', targetNodeId: 'node-99' },
                ],
                order: 0,
            },
            'node-2': {
                id: 'node-2',
                type: 'question',
                title: 'Does the patient report chest pain?',
                options: [
                    { id: 'opt-2-1', label: 'Yes', targetNodeId: 'node-3' },
                    { id: 'opt-2-2', label: 'No', targetNodeId: 'node-8' },
                ],
                order: 1,
            },
            'node-3': {
                id: 'node-3',
                type: 'question',
                title: 'Is the pain radiating to the left arm, jaw, or back?',
                options: [
                    { id: 'opt-3-1', label: 'Yes', targetNodeId: 'node-4' },
                    { id: 'opt-3-2', label: 'No', targetNodeId: 'node-5' },
                ],
                order: 2,
            },
            'node-4': {
                id: 'node-4',
                type: 'end',
                title: 'Outcome: Critical Cardiac Event',
                riskLevel: 'critical',
                riskScore: 95,
                priority: 'immediate',
                recommendedActions: [
                    'Activate Code STEMI',
                    '12-lead ECG immediately',
                    'Aspirin 325mg PO',
                    'IV access x2',
                    'Call Cath Lab',
                    'Continuous monitoring'
                ],
                options: [],
                order: 3,
            },
            'node-5': {
                id: 'node-5',
                type: 'question',
                title: 'Describe the chest pain character:',
                options: [
                    { id: 'opt-5-1', label: 'Crushing/Pressure', targetNodeId: 'node-6' },
                    { id: 'opt-5-2', label: 'Sharp/Pleuritic', targetNodeId: 'node-7' },
                    { id: 'opt-5-3', label: 'Mild/Atypical', targetNodeId: 'node-8' },
                ],
                order: 4,
            },
            'node-6': {
                id: 'node-6',
                type: 'end',
                title: 'Outcome: High Risk ACS',
                riskLevel: 'high',
                riskScore: 78,
                priority: 'urgent',
                recommendedActions: [
                    '12-lead ECG',
                    'Troponin + CK-MB',
                    'Aspirin + Nitrates',
                    'IV access',
                    'Cardiology consult'
                ],
                options: [],
                order: 5,
            },
            'node-7': {
                id: 'node-7',
                type: 'end',
                title: 'Outcome: Moderate Risk / Potential PE',
                riskLevel: 'medium',
                riskScore: 50,
                priority: 'delayed',
                recommendedActions: [
                    'Chest X-ray',
                    'D-dimer',
                    'O2 monitoring',
                    'Consider PE workup'
                ],
                options: [],
                order: 6,
            },
            'node-8': {
                id: 'node-8',
                type: 'end',
                title: 'Outcome: Low Risk Assessment',
                riskLevel: 'low',
                riskScore: 25,
                priority: 'minimal',
                recommendedActions: [
                    'Vitals every 15min',
                    'Standard workup',
                    'Monitor for change'
                ],
                options: [],
                order: 7,
            },
            'node-99': {
                id: 'node-99',
                type: 'end',
                title: 'Outcome: Immediate Resuscitation',
                riskLevel: 'critical',
                riskScore: 100,
                priority: 'immediate',
                recommendedActions: [
                    'CODE BLUE',
                    'Call resuscitation team',
                    'Start CPR if no pulse',
                    'Defibrillator ready'
                ],
                options: [],
                order: 8,
            }
        }
    },
    {
        id: 'template-respiratory',
        name: 'Respiratory Distress Assessment',
        description: 'Protocol for evaluating breathing difficulty and SpO2 levels.',
        version: '1.0.0',
        author: 'TriageFlow Medical Board',
        tags: ['Respiratory', 'Emergency'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startNodeId: 'resp-1',
        isTemplate: true,
        isPublished: true,
        estimatedMinutes: 4,
        nodes: {
            'resp-1': {
                id: 'resp-1',
                type: 'start',
                title: 'Assess level of consciousness',
                options: [
                    { id: 'ro-1-1', label: 'Alert', targetNodeId: 'resp-2' },
                    { id: 'ro-1-2', label: 'Altered/Unconscious', targetNodeId: 'resp-crit' },
                ],
                order: 0,
            },
            'resp-2': {
                id: 'resp-2',
                type: 'question',
                title: 'Is SpO2 < 90% on room air?',
                options: [
                    { id: 'ro-2-1', label: 'Yes', targetNodeId: 'resp-crit' },
                    { id: 'ro-2-2', label: 'No (90% or higher)', targetNodeId: 'resp-3' },
                ],
                order: 1,
            },
            'resp-3': {
                id: 'resp-3',
                type: 'condition',
                title: 'SpO2 90-94% or Respiratory Rate > 30?',
                options: [
                    { id: 'ro-3-1', label: 'Yes', targetNodeId: 'resp-high' },
                    { id: 'ro-3-2', label: 'No', targetNodeId: 'resp-4' },
                ],
                order: 2,
            },
            'resp-4': {
                id: 'resp-4',
                type: 'question',
                title: 'Are there signs of stridor or airway obstruction?',
                options: [
                    { id: 'ro-4-1', label: 'Yes', targetNodeId: 'resp-crit' },
                    { id: 'ro-4-2', label: 'No', targetNodeId: 'resp-5' },
                ],
                order: 3,
            },
            'resp-5': {
                id: 'resp-5',
                type: 'question',
                title: 'Known history of Asthma or COPD?',
                options: [
                    { id: 'ro-5-1', label: 'Yes (Exacerbation)', targetNodeId: 'resp-med' },
                    { id: 'ro-5-2', label: 'No / Mild symptoms', targetNodeId: 'resp-low' },
                ],
                order: 4,
            },
            'resp-crit': {
                id: 'resp-crit',
                type: 'end',
                title: 'Outcome: Critical Respiratory Failure',
                riskLevel: 'critical',
                riskScore: 98,
                priority: 'immediate',
                recommendedActions: [
                    'Intubation protocol',
                    'High-flow O2 (15L/min)',
                    'Continuous monitoring',
                    'ABG analysis',
                    'Escalate to ICU'
                ],
                options: [],
                order: 5,
            },
            'resp-high': {
                id: 'resp-high',
                type: 'end',
                title: 'Outcome: Severe Respiratory Distress',
                riskLevel: 'high',
                riskScore: 80,
                priority: 'urgent',
                recommendedActions: [
                    'Oxygen therapy (Titrate to 94%)',
                    'Nebulized bronchodilators',
                    'Chest X-ray',
                    'Close monitoring'
                ],
                options: [],
                order: 6,
            },
            'resp-med': {
                id: 'resp-med',
                type: 'end',
                title: 'Outcome: Moderate Exacerbation',
                riskLevel: 'medium',
                riskScore: 55,
                priority: 'delayed',
                recommendedActions: [
                    'Bronchodilator therapy',
                    'Consider corticosteroids',
                    'Observe SpO2 trends'
                ],
                options: [],
                order: 7,
            },
            'resp-low': {
                id: 'resp-low',
                type: 'end',
                title: 'Outcome: Stable Respiratory Status',
                riskLevel: 'low',
                riskScore: 20,
                priority: 'minimal',
                recommendedActions: [
                    'Observation',
                    'Routine vitals',
                    'Discharge if stable'
                ],
                options: [],
                order: 8,
            }
        }
    },
    {
        id: 'template-trauma',
        name: 'Trauma Primary Survey (ABCDE)',
        description: 'Systematic approach to identifying life-threatening injuries.',
        version: '1.0.0',
        author: 'TriageFlow Medical Board',
        tags: ['Trauma', 'Emergency', 'ABCDE'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startNodeId: 'trauma-a',
        isTemplate: true,
        isPublished: true,
        estimatedMinutes: 6,
        nodes: {
            'trauma-a': {
                id: 'trauma-a',
                type: 'start',
                title: 'A: Airway compromise or C-spine risk?',
                options: [
                    { id: 'to-a-1', label: 'Yes', targetNodeId: 'trauma-crit' },
                    { id: 'to-a-2', label: 'No', targetNodeId: 'trauma-b' },
                ],
                order: 0,
            },
            'trauma-b': {
                id: 'trauma-b',
                type: 'question',
                title: 'B: Breathing difficulty or SpO2 < 94%?',
                options: [
                    { id: 'to-b-1', label: 'Yes', targetNodeId: 'trauma-high' },
                    { id: 'to-b-2', label: 'No', targetNodeId: 'trauma-c' },
                ],
                order: 1,
            },
            'trauma-c': {
                id: 'trauma-c',
                type: 'question',
                title: 'C: Active major bleeding or signs of shock?',
                options: [
                    { id: 'to-c-1', label: 'Yes', targetNodeId: 'trauma-crit' },
                    { id: 'to-c-2', label: 'No', targetNodeId: 'trauma-d' },
                ],
                order: 2,
            },
            'trauma-d': {
                id: 'trauma-d',
                type: 'question',
                title: 'D: GCS < 9 or focal neuro deficit?',
                options: [
                    { id: 'to-d-1', label: 'Yes', targetNodeId: 'trauma-high' },
                    { id: 'to-d-2', label: 'No', targetNodeId: 'trauma-e' },
                ],
                order: 3,
            },
            'trauma-e': {
                id: 'trauma-e',
                type: 'question',
                title: 'E: Hypothermia or significant external injuries?',
                options: [
                    { id: 'to-e-1', label: 'Yes', targetNodeId: 'trauma-med' },
                    { id: 'to-e-2', label: 'No / Minor', targetNodeId: 'trauma-low' },
                ],
                order: 4,
            },
            'trauma-crit': {
                id: 'trauma-crit',
                type: 'end',
                title: 'Outcome: Critical Trauma (Immediate)',
                riskLevel: 'critical',
                riskScore: 100,
                priority: 'immediate',
                recommendedActions: [
                    'Stop massive hemorrhage',
                    'Airway management / Intubation',
                    'C-spine stabilization',
                    'Massive transfusion protocol (MTP)',
                    'Immediate surgical consult'
                ],
                options: [],
                order: 5,
            },
            'trauma-high': {
                id: 'trauma-high',
                type: 'end',
                title: 'Outcome: Severe Trauma (Urgent)',
                riskLevel: 'high',
                riskScore: 85,
                priority: 'urgent',
                recommendedActions: [
                    'High-flow O2',
                    'FAST exam',
                    'IV fluids',
                    'Stabilize fractures',
                    'Trauma surgery consult'
                ],
                options: [],
                order: 6,
            },
            'trauma-med': {
                id: 'trauma-med',
                type: 'end',
                title: 'Outcome: Moderate Trauma (Delayed)',
                riskLevel: 'medium',
                riskScore: 60,
                priority: 'delayed',
                recommendedActions: [
                    'Analgesia',
                    'Wound care',
                    'Imaging studies',
                    'Tetanus prophylaxis'
                ],
                options: [],
                order: 7,
            },
            'trauma-low': {
                id: 'trauma-low',
                type: 'end',
                title: 'Outcome: Minor Trauma (Minimal)',
                riskLevel: 'low',
                riskScore: 15,
                priority: 'minimal',
                recommendedActions: [
                    'Minor wound care',
                    'Observation',
                    'Patient education'
                ],
                options: [],
                order: 8,
            }
        }
    }
];
