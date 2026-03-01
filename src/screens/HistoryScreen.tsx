import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useSessionStore } from '../store/sessionStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { EmptyState } from '../components/shared/EmptyState';
import { RiskBadge } from '../components/shared/RiskBadge';
import { TriageSession } from '../types';
import { PlayerStackParamList } from '../navigation/PlayerStack';

type NavigationProp = NativeStackNavigationProp<PlayerStackParamList, 'Player'>;

export const HistoryScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();

    const sessions = useSessionStore(state =>
        Object.values(state.sessions)
            .filter(s => s.isCompleted)
            .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    );

    const deleteSession = useSessionStore(state => state.deleteSession);

    const handleDelete = (id: string, patientId: string) => {
        Alert.alert(
            'Delete Session',
            `Delete assessment for Patient ${patientId}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteSession(id) }
            ]
        );
    };

    const renderItem = ({ item }: { item: TriageSession }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Triage' as any, { screen: 'SessionResult', params: { sessionId: item.id } })}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.patientId, { color: colors.text }]}>{item.patientId}</Text>
                    <Text style={[styles.protocolName, { color: colors.textSecondary }]}>{item.flowchartName}</Text>
                </View>
                {item.finalRiskLevel && (
                    <RiskBadge level={item.finalRiskLevel} size="small" />
                )}
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                        {new Date(item.completedAt || '').toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.patientId)}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Triage History" subtitle={`${sessions.length} assessments`} />

            <View style={styles.listContainer}>
                <FlashList
                    data={sessions}
                    renderItem={renderItem}
                    estimatedItemSize={100}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="history"
                            title="No History"
                            message="Completed triage assessments will appear here."
                        />
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
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    patientId: {
        fontSize: 16,
        fontWeight: '700',
    },
    protocolName: {
        fontSize: 13,
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        marginLeft: 4,
    },
});
