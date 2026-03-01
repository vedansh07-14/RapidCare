import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useSessionStore } from '../store/sessionStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { EmptyState } from '../components/shared/EmptyState';
import { PatientStackParamList } from '../navigation/PatientStack';
import { TriageSession } from '../types';

type NavigationProp = NativeStackNavigationProp<PatientStackParamList, 'PatientsList'>;

interface PatientRecord {
    patientId: string;
    totalAssessments: number;
    lastAssessmentDate: string;
    lastProtocol: string;
}

export const PatientsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const sessions = useSessionStore(state => Object.keys(state.sessions).map(id => state.sessions[id]));

    const patientRecords = React.useMemo(() => {
        const records: Record<string, PatientRecord> = {};

        sessions.forEach(session => {
            const pid = session.patientId;
            const date = session.completedAt || session.startedAt;

            if (!records[pid]) {
                records[pid] = {
                    patientId: pid,
                    totalAssessments: 1,
                    lastAssessmentDate: date,
                    lastProtocol: session.flowchartName,
                };
            } else {
                records[pid].totalAssessments += 1;
                if (new Date(date) > new Date(records[pid].lastAssessmentDate)) {
                    records[pid].lastAssessmentDate = date;
                    records[pid].lastProtocol = session.flowchartName;
                }
            }
        });

        return Object.keys(records).map(key => records[key]).sort((a, b) =>
            new Date(b.lastAssessmentDate).getTime() - new Date(a.lastAssessmentDate).getTime()
        );
    }, [sessions]);

    const renderItem = ({ item }: { item: PatientRecord }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('PatientDetail', { patientId: item.patientId })}
        >
            <View style={styles.cardInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.patientId, { color: colors.text }]}>{item.patientId}</Text>
                    <Text style={[styles.subText, { color: colors.textSecondary }]}>
                        Last: {item.lastProtocol}
                    </Text>
                </View>
            </View>

            <View style={styles.cardMeta}>
                <View style={styles.badge}>
                    <Text style={[styles.badgeText, { color: colors.textTertiary }]}>
                        {item.totalAssessments} {item.totalAssessments === 1 ? 'Exam' : 'Exams'}
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                    {new Date(item.lastAssessmentDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Patients"
                subtitle={`${patientRecords.length} clinical records`}
            />

            <View style={styles.listContainer}>
                <FlashList
                    data={patientRecords}
                    renderItem={renderItem}
                    estimatedItemSize={80}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="account-group-outline"
                            title="No Patients"
                            message="Patient records will appear here as you perform triage assessments."
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    patientId: {
        fontSize: 16,
        fontWeight: '700',
    },
    subText: {
        fontSize: 12,
        marginTop: 2,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        marginRight: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dateText: {
        fontSize: 12,
        marginRight: 8,
    },
});
