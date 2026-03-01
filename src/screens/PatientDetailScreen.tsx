import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useSessionStore } from '../store/sessionStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { RiskBadge } from '../components/shared/RiskBadge';
import { PatientStackParamList } from '../navigation/PatientStack';
import { TriageSession } from '../types';

type NavigationProp = NativeStackNavigationProp<PatientStackParamList, 'PatientDetail'>;
type ScreenRouteProp = RouteProp<PatientStackParamList, 'PatientDetail'>;

export const PatientDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { patientId } = route.params;
    const { colors } = useTheme();

    const patientSessions = useSessionStore(state =>
        Object.keys(state.sessions).map(id => state.sessions[id])
            .filter(s => s.patientId === patientId)
            .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())
    );

    const renderItem = ({ item }: { item: TriageSession }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Triage' as any, {
                screen: 'SessionResult',
                params: { sessionId: item.id }
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.typeInfo}>
                    <MaterialCommunityIcons
                        name={item.isCompleted ? "check-circle" : "clock-outline"}
                        size={16}
                        color={item.isCompleted ? colors.primary : colors.warning}
                    />
                    <Text style={[styles.protocolLabel, { color: colors.textSecondary }]}>
                        {item.flowchartName}
                    </Text>
                </View>
                {item.finalRiskLevel && (
                    <RiskBadge level={item.finalRiskLevel} size="small" />
                )}
            </View>

            <View style={styles.cardBody}>
                <Text style={[styles.outcomeText, { color: colors.text }]}>
                    {item.outcome || (item.isCompleted ? 'Completed' : 'In Progress')}
                </Text>
                <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                    {new Date(item.completedAt || item.startedAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    })}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title={patientId}
                subtitle="Patient Assessment History"
                leftIcon="arrow-left"
                onLeftPress={() => navigation.goBack()}
            />

            <View style={styles.listContainer}>
                <FlashList
                    data={patientSessions}
                    renderItem={renderItem}
                    estimatedItemSize={120}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.statsRow}>
                            <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.statValue, { color: colors.primary }]}>{patientSessions.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Total Exams</Text>
                            </View>
                            <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {patientSessions.filter(s => s.finalRiskLevel === 'critical' || s.finalRiskLevel === 'high').length}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>High Risk</Text>
                            </View>
                        </View>
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    protocolLabel: {
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '600',
    },
    cardBody: {
        marginTop: 4,
    },
    outcomeText: {
        fontSize: 16,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 12,
        marginTop: 4,
    },
});
