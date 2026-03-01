import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Alert,
    Share
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useSessionStore } from '../store/sessionStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { ResultCard } from '../components/player/ResultCard';
import { PathTimeline } from '../components/player/PathTimeline';
import { Button } from '../components/shared/Button';
import { PlayerStackParamList } from '../navigation/PlayerStack';
import { generateSessionSummary } from '../utils/exportUtils';
import { Toast } from '../components/shared/Toast';

type NavigationProp = NativeStackNavigationProp<PlayerStackParamList, 'SessionResult'>;
type ScreenRouteProp = RouteProp<PlayerStackParamList, 'SessionResult'>;

export const SessionResultScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { sessionId } = route.params;
    const { colors } = useTheme();

    const session = useSessionStore(state => state.sessions[sessionId]);

    const handleShare = async () => {
        if (!session) return;
        const summary = generateSessionSummary(session);
        try {
            await Share.share({
                message: summary,
                title: `Triage Assessment: ${session.patientId}`,
            });
        } catch (error) {
            Toast.show({ message: 'Failed to share report', type: 'error' });
        }
    };

    if (!session) return null;

    // Find the final outcome node from the flowchart
    // Note: Since we saved the outcome, we can mock a node for the ResultCard
    const mockNode = {
        id: 'result',
        type: 'end' as const,
        title: session.outcome,
        riskLevel: session.finalRiskLevel,
        riskScore: session.finalRiskScore,
        priority: session.finalPriority,
        description: session.instructions || 'Assessment completed.',
        options: [],
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Assessment Result"
                rightIcon="share-variant"
                onRightPress={handleShare}
                leftIcon="close"
                onLeftPress={() => navigation.navigate('Player' as any, { flowchartId: session.flowchartId })}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ResultCard node={mockNode as any} />

                {(session.instructions || (session.recommendedActions && session.recommendedActions.length > 0)) && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PROPOSED SOLUTION</Text>
                        <View style={[styles.solutionBox, { backgroundColor: colors.surface, borderColor: colors.primary + '40' }]}>
                            {session.instructions && (
                                <Text style={[styles.instructionText, { color: colors.text }]}>{session.instructions}</Text>
                            )}

                            {session.recommendedActions && session.recommendedActions.length > 0 && (
                                <View style={styles.actionList}>
                                    {session.recommendedActions.map((action, idx) => (
                                        <View key={idx} style={styles.actionRow}>
                                            <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.primary} />
                                            <Text style={[styles.actionText, { color: colors.text }]}>{action}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {session.notes && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>CLINICIAN NOTES</Text>
                        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ color: colors.text, fontStyle: 'italic' }}>"{session.notes}"</Text>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PATIENT INFO</Text>
                    <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Patient ID:</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{session.patientId}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date:</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {new Date(session.completedAt || session.startedAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Protocol:</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{session.flowchartName}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ASSESSMENT PATH</Text>
                    <PathTimeline steps={session.steps} />
                </View>

                <Button
                    title="Done"
                    onPress={() => navigation.navigate('Home' as any)}
                    size="large"
                    variant="outline"
                    style={styles.doneBtn}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginTop: 24,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: 1,
    },
    solutionBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderLeftWidth: 4,
    },
    instructionText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    actionList: {
        marginTop: 4,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    doneBtn: {
        marginTop: 32,
    },
});
