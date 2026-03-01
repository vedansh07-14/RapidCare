import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    ScrollView,
    Dimensions,
    TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
    FadeInRight,
    FadeOutLeft,
    Layout
} from 'react-native-reanimated';

import { useFlowchartStore } from '../store/flowchartStore';
import { useSessionStore } from '../store/sessionStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { QuestionCard } from '../components/player/QuestionCard';
import { OptionButton } from '../components/player/OptionButton';
import { ResultCard } from '../components/player/ResultCard';
import { Button } from '../components/shared/Button';
import { PlayerStackParamList } from '../navigation/PlayerStack';
import { FlowNode, NodeOption, SessionStep } from '../types';
import { Toast } from '../components/shared/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<PlayerStackParamList, 'Player'>;
type ScreenRouteProp = RouteProp<PlayerStackParamList, 'Player'>;

export const PlayerScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { flowchartId } = route.params || {};
    const { colors } = useTheme();

    const flowchart = useFlowchartStore(state => flowchartId ? state.flowcharts[flowchartId] : null);
    const startSession = useSessionStore(state => state.startSession);
    const completeSession = useSessionStore(state => state.completeSession);
    const abandonSession = useSessionStore(state => state.abandonSession);
    const sessions = useSessionStore(state => state.sessions);
    const activeSessionId = useSessionStore(state => state.activeSessionId);
    const pushStep = useSessionStore(state => state.pushStep);
    const goBackInSession = useSessionStore(state => state.goBackInSession);

    const activeSession = useMemo(() => {
        if (!activeSessionId) return null;
        return sessions[activeSessionId] || null;
    }, [sessions, activeSessionId]);

    const [patientId, setPatientId] = useState('');
    const [isStarted, setIsStarted] = useState(false);

    // Sync state with active session on mount or when session changes
    useEffect(() => {
        if (activeSession && activeSession.flowchartId === flowchartId && !activeSession.isCompleted) {
            setIsStarted(true);
            setPatientId(activeSession.patientId);
        } else {
            setIsStarted(false);
            setPatientId('');
        }
    }, [activeSessionId, flowchartId]);

    const steps = useMemo(() => activeSession?.steps || [], [activeSession]);

    const currentNode = useSessionStore(useCallback(state => state.getCurrentNode({ [flowchartId || '']: flowchart as any }), [flowchart, flowchartId]));

    const handleStart = () => {
        if (!patientId.trim()) {
            Toast.show({ message: 'Please enter a Patient ID', type: 'warning' });
            return;
        }
        startSession(flowchartId, flowchart?.name || '', patientId);
        setIsStarted(true);
    };

    const handleOptionPress = (option: NodeOption) => {
        if (!currentNode) return;

        const newStep: SessionStep = {
            nodeId: currentNode.id,
            nodeTitle: currentNode.title,
            chosenOptionId: option.id,
            chosenOptionLabel: option.label,
            timestamp: new Date().toISOString(),
        };

        pushStep(newStep);

        if (!flowchart?.nodes[option.targetNodeId]) {
            Alert.alert(
                'Navigation Error',
                'Next step not found in protocol. End assessment here?',
                [
                    { text: 'Go Back', style: 'cancel' },
                    { text: 'End Session', onPress: () => handleComplete() }
                ]
            );
        }
    };

    const handleBack = () => {
        if (steps.length === 0) {
            Alert.alert('Exit Session', 'Discard this assessment?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Exit', style: 'destructive', onPress: () => {
                        abandonSession();
                        navigation.goBack();
                    }
                }
            ]);
            return;
        }

        goBackInSession();
    };

    const handleComplete = (notes?: string) => {
        if (!activeSessionId || !currentNode) return;

        const finalStep: SessionStep = {
            nodeId: currentNode.id,
            nodeTitle: currentNode.title,
            timestamp: new Date().toISOString()
        };

        pushStep(finalStep);

        // Update session with final results
        useSessionStore.getState().updateActiveSession({
            outcome: currentNode.title,
            instructions: currentNode.description,
            recommendedActions: currentNode.recommendedActions,
            finalRiskLevel: currentNode.riskLevel,
            finalRiskScore: currentNode.riskScore,
            finalPriority: currentNode.priority,
            notes: notes || ''
        });

        completeSession(notes);
        navigation.replace('SessionResult', { sessionId: activeSessionId });
    };

    if (!flowchart) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.textTertiary} />
                <Text style={[styles.startTitle, { color: colors.text, textAlign: 'center' }]}>No Protocol Selected</Text>
                <Text style={[styles.startDesc, { color: colors.textSecondary }]}>
                    Please select a protocol from the Home or Protocol list to start an assessment.
                </Text>
                <Button
                    title="Go to Protocols"
                    onPress={() => navigation.navigate('Builder' as any)}
                    style={{ width: '100%' }}
                />
            </View>
        );
    }

    if (!isStarted) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header
                    title="Start Assessment"
                    leftIcon="close"
                    onLeftPress={() => navigation.goBack()}
                />
                <View style={styles.startContent}>
                    <MaterialCommunityIcons name="clipboard-pulse-outline" size={80} color={colors.primary} />
                    <Text style={[styles.startTitle, { color: colors.text }]}>New Triage Session</Text>
                    <Text style={[styles.startDesc, { color: colors.textSecondary }]}>
                        Protocol: {flowchart.name}
                    </Text>

                    <View style={styles.inputBox}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Enter Patient ID / MRN</Text>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={[styles.patientInput, { borderColor: colors.border, backgroundColor: colors.surface }]}
                        >
                            <MaterialCommunityIcons name="account-search" size={20} color={colors.textTertiary} />
                            <TextInput
                                style={{
                                    flex: 1,
                                    fontSize: 18,
                                    color: colors.text,
                                    marginLeft: 10,
                                    height: '100%',
                                }}
                                placeholder="Ex: P-99824"
                                placeholderTextColor={colors.placeholder}
                                value={patientId}
                                onChangeText={setPatientId}
                            />
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="Begin Triage"
                        onPress={handleStart}
                        size="large"
                        style={styles.startBtn}
                        icon="play-circle"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.flex}>
                <View style={styles.progressHeader}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { backgroundColor: colors.primary, width: `${Math.min((steps.length / 10) * 100, 100)}%` }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: colors.textTertiary }]}>Step {steps.length + 1}</Text>
                    </View>
                    <TouchableOpacity onPress={() => Alert.alert('Exit', 'Cancel session?', [
                        { text: 'Continue', style: 'cancel' },
                        {
                            text: 'Exit', style: 'destructive', onPress: () => {
                                abandonSession();
                                navigation.goBack();
                            }
                        }
                    ])}>
                        <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.runnerContent}>
                    {currentNode && (
                        <Animated.View
                            key={currentNode.id}
                            entering={FadeInRight.duration(400)}
                            exiting={FadeOutLeft.duration(400)}
                            layout={Layout.springify()}
                            style={styles.cardWrapper}
                        >
                            {currentNode.type === 'end' ? (
                                <View>
                                    <ResultCard node={currentNode} />
                                    <Button
                                        title="Finish & Save Assessment"
                                        onPress={() => handleComplete()}
                                        size="large"
                                        variant="primary"
                                        style={styles.completeBtn}
                                    />
                                    <Button
                                        title="Add Notes & Finish"
                                        onPress={() => {
                                            Alert.prompt('Session Notes', 'Enter any additional observations', [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Save', onPress: (notes: string | undefined) => handleComplete(notes || '') }
                                            ]);
                                        }}
                                        variant="ghost"
                                    />
                                </View>
                            ) : (
                                <View>
                                    <QuestionCard node={currentNode} />
                                    <View style={styles.optionsContainer}>
                                        {currentNode.options.map((option, index) => (
                                            <OptionButton
                                                key={option.id}
                                                index={index}
                                                label={option.label}
                                                color={option.color}
                                                onPress={() => handleOptionPress(option)}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </Animated.View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    startContent: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 20,
        marginBottom: 8,
    },
    startDesc: {
        fontSize: 16,
        marginBottom: 40,
        textAlign: 'center',
    },
    inputBox: {
        width: '100%',
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    patientInput: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    startBtn: {
        width: '100%',
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        padding: 8,
    },
    progressContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    progressBar: {
        height: 4,
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
    },
    progressText: {
        fontSize: 10,
        fontWeight: '700',
    },
    runnerContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    cardWrapper: {
        width: '100%',
        marginTop: 10,
    },
    optionsContainer: {
        marginTop: 30,
    },
    completeBtn: {
        marginTop: 20,
        marginBottom: 10,
    }
});
