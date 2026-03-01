import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ImageBackground
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../hooks/useTheme';
import { useFlowchartStore } from '../store/flowchartStore';
import { useSessionStore } from '../store/sessionStore';
import { Button } from '../components/shared/Button';
import { TabParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<TabParamList, 'Home'>;

export const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors, isDark } = useTheme();

    const flowchartsCount = useFlowchartStore(state => Object.keys(state.flowcharts).length);
    const sessions = useSessionStore(state =>
        Object.values(state.sessions)
            .filter(s => s.isCompleted)
            .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    );

    const featuredProtocols = useFlowchartStore(state =>
        Object.values(state.flowcharts).slice(0, 3)
    );

    const StatCard = ({ icon, label, value, color }: { icon: string, label: string, value: string | number, color: string }) => (
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon as any} size={24} color={color} />
            </View>
            <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Ready for Assessment</Text>
                        <Text style={[styles.brand, { color: colors.text }]}>TriageFlow</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Settings' as any)}
                    >
                        <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard
                        icon="file-tree"
                        label="Protocols"
                        value={flowchartsCount}
                        color={colors.primary}
                    />
                    <StatCard
                        icon="account-group"
                        label="Patients"
                        value={Object.keys(sessions.reduce((acc, s) => ({ ...acc, [s.patientId]: true }), {})).length}
                        color={colors.warning}
                    />
                    <StatCard
                        icon="history"
                        label="Sessions"
                        value={sessions.length}
                        color={colors.success}
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>QUICK ACTIONS</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('Triage' as any)}
                        >
                            <MaterialCommunityIcons name="heart-pulse" size={28} color="white" />
                            <Text style={styles.actionLabel}>New Triage</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('Patients' as any)}
                        >
                            <MaterialCommunityIcons name="account-group" size={28} color={colors.primary} />
                            <Text style={[styles.actionLabel, { color: colors.text }]}>Patients</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('Builder' as any)}
                        >
                            <MaterialCommunityIcons name="tools" size={28} color={colors.primary} />
                            <Text style={[styles.actionLabel, { color: colors.text }]}>Builder</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Featured Protocols */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECENT PROTOCOLS</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Builder' as any)}>
                            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {featuredProtocols.length === 0 ? (
                        <TouchableOpacity
                            style={[styles.emptyProtocols, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}
                            onPress={() => navigation.navigate('Templates')}
                        >
                            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Import a template to get started</Text>
                        </TouchableOpacity>
                    ) : (
                        featuredProtocols.map(proto => (
                            <TouchableOpacity
                                key={proto.id}
                                style={[styles.protocolItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => navigation.navigate('Triage' as any, { screen: 'Player', params: { flowchartId: proto.id } })}
                            >
                                <View style={[styles.protocolIcon, { backgroundColor: colors.primary + '10' }]}>
                                    <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.protocolInfo}>
                                    <Text style={[styles.protocolName, { color: colors.text }]}>{proto.name}</Text>
                                    <Text style={[styles.protocolMeta, { color: colors.textTertiary }]}>v{proto.version} • {Object.keys(proto.nodes).length} nodes</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Recent History */}
                {sessions.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECENT ASSESSMENTS</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('History')}>
                                <Text style={[styles.seeAll, { color: colors.primary }]}>View History</Text>
                            </TouchableOpacity>
                        </View>

                        {sessions.slice(0, 3).map(session => (
                            <TouchableOpacity
                                key={session.id}
                                style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => navigation.navigate('Triage' as any, { screen: 'SessionResult', params: { sessionId: session.id } })}
                            >
                                <View style={styles.historyLeft}>
                                    <Text style={[styles.historyPatient, { color: colors.text }]}>Patient: {session.patientId}</Text>
                                    <Text style={[styles.historyDate, { color: colors.textTertiary }]}>
                                        {new Date(session.completedAt || '').toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.historyRight}>
                                    {session.finalRiskLevel && (
                                        <View style={[styles.dot, { backgroundColor: colors[session.finalRiskLevel as keyof typeof colors] as string || colors.primary }]} />
                                    )}
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

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
        paddingTop: 60,
        paddingBottom: 40,
    },
    hero: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    brand: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    settingsBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        flex: 0.48,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '700',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCard: {
        flex: 0.48,
        height: 120,
        borderRadius: 20,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 12,
    },
    protocolItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    protocolIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    protocolInfo: {
        flex: 1,
    },
    protocolName: {
        fontSize: 15,
        fontWeight: '700',
    },
    protocolMeta: {
        fontSize: 11,
        marginTop: 2,
    },
    emptyProtocols: {
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 13,
        marginTop: 8,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    historyLeft: {
        flex: 1,
    },
    historyPatient: {
        fontSize: 15,
        fontWeight: '700',
    },
    historyDate: {
        fontSize: 12,
        marginTop: 4,
    },
    historyRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
});
