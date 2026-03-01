import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
    TriageSession,
    SessionStep,
    SessionState,
    Flowchart,
    FlowNode
} from '../types';

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            sessions: {},
            activeSessionId: null,

            startSession: (flowchartId, flowchartName, patientId) => {
                const id = uuidv4();
                const newSession: TriageSession = {
                    id,
                    flowchartId,
                    flowchartName,
                    patientId,
                    startedAt: new Date().toISOString(),
                    steps: [],
                    isCompleted: false,
                };

                set(state => ({
                    sessions: { ...state.sessions, [id]: newSession },
                    activeSessionId: id,
                }));

                return id;
            },

            advanceSession: (chosenOptionId) => {
                const { activeSessionId, sessions } = get();
                if (!activeSessionId || !sessions[activeSessionId]) return;

                set(state => {
                    const session = state.sessions[activeSessionId];
                    // The UI should have pushed the step already, or we do it here.
                    // For maximum "flawless" integration, let's make this the primary way to move forward.
                    return {
                        sessions: {
                            ...state.sessions,
                            [activeSessionId]: {
                                ...session,
                                updatedAt: new Date().toISOString()
                            }
                        }
                    };
                });
            },

            // Manual update to push a specific step
            pushStep: (step: SessionStep) => {
                const { activeSessionId, sessions } = get();
                if (!activeSessionId || !sessions[activeSessionId]) return;

                set(state => ({
                    sessions: {
                        ...state.sessions,
                        [activeSessionId]: {
                            ...state.sessions[activeSessionId],
                            steps: [...state.sessions[activeSessionId].steps, step]
                        }
                    }
                }));
            },

            goBackInSession: () => {
                const { activeSessionId, sessions } = get();
                if (!activeSessionId || !sessions[activeSessionId]) return;

                set(state => {
                    const session = state.sessions[activeSessionId];
                    const newSteps = [...session.steps];
                    newSteps.pop();

                    return {
                        sessions: {
                            ...state.sessions,
                            [activeSessionId]: {
                                ...session,
                                steps: newSteps
                            }
                        }
                    };
                });
            },

            completeSession: (notes) => {
                const { activeSessionId, sessions } = get();
                if (!activeSessionId || !sessions[activeSessionId]) return;

                set(state => {
                    const session = state.sessions[activeSessionId];
                    // Final outcomes should be set by the UI before or during completion
                    return {
                        sessions: {
                            ...state.sessions,
                            [activeSessionId]: {
                                ...session,
                                isCompleted: true,
                                completedAt: new Date().toISOString(),
                                notes: notes || session.notes
                            }
                        },
                        activeSessionId: null
                    };
                });
            },

            abandonSession: () => {
                set({ activeSessionId: null });
            },

            deleteSession: (id) => {
                set(state => {
                    const { [id]: _, ...remaining } = state.sessions;
                    return { sessions: remaining };
                });
            },

            getActiveSession: () => {
                const { activeSessionId, sessions } = get();
                if (!activeSessionId) return null;
                return sessions[activeSessionId] || null;
            },

            getCurrentNode: (flowcharts: Record<string, Flowchart>) => {
                const session = get().getActiveSession();
                if (!session) return null;

                const flowchart = flowcharts[session.flowchartId];
                if (!flowchart) return null;

                if (session.steps.length === 0) {
                    return flowchart.nodes[flowchart.startNodeId] || null;
                }

                const lastStep = session.steps[session.steps.length - 1];
                // The lastStep.chosenOptionId tells us where we went.
                // We need to find which node that option leads to.
                const prevNodeId = lastStep.nodeId;
                const prevNode = flowchart.nodes[prevNodeId];
                if (!prevNode) return null;

                const chosenOption = prevNode.options.find(o => o.id === lastStep.chosenOptionId);
                if (!chosenOption) return null;

                return flowchart.nodes[chosenOption.targetNodeId] || null;
            },

            updateActiveSession: (updates: Partial<TriageSession>) => {
                const { activeSessionId, sessions } = get();
                if (!activeSessionId || !sessions[activeSessionId]) return;

                set(state => ({
                    sessions: {
                        ...state.sessions,
                        [activeSessionId]: {
                            ...state.sessions[activeSessionId],
                            ...updates
                        }
                    }
                }));
            }
        }),
        {
            name: 'triage-sessions',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
