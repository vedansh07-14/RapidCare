import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlowNode, RiskLevel, Priority } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { RiskGauge } from './RiskGauge';
import { RiskBadge } from '../shared/RiskBadge';
import { getRiskColor, getPriorityColor } from '../../utils/riskUtils';

interface ResultCardProps {
    node: FlowNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ node }) => {
    const { colors, isDark } = useTheme();

    const riskColor = getRiskColor(node.riskLevel || 'low', isDark);
    const priorityColor = getPriorityColor(node.priority || 'minimal', isDark);

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: riskColor }]}>
                <Text style={styles.headerTitle}>ASSESSMENT COMPLETE</Text>
                <Text style={styles.headerSubtitle}>{node.title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gaugeContainer}>
                    <RiskGauge
                        score={node.riskScore || 0}
                        level={node.riskLevel || 'low'}
                        size={220}
                    />
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>PRIORITY</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20', borderColor: priorityColor }]}>
                            <Text style={[styles.priorityText, { color: priorityColor }]}>
                                {node.priority?.toUpperCase() || 'NORMAL'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>EST. TIME</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                            {node.estimatedTimeMinutes ? `${node.estimatedTimeMinutes}m` : '--'}
                        </Text>
                    </View>
                </View>

                {node.description ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>OUTCOME SUMMARY</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {node.description}
                        </Text>
                    </View>
                ) : null}

                {node.recommendedActions && node.recommendedActions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECOMMENDED ACTIONS</Text>
                        {node.recommendedActions.map((action, i) => (
                            <View key={`action-${i}`} style={styles.actionItem}>
                                <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} />
                                <Text style={[styles.actionText, { color: colors.text }]}>{action}</Text>
                            </View>
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
        borderRadius: 16,
        overflow: 'hidden',
    },
    header: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 4,
        opacity: 0.9,
    },
    headerSubtitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    gaugeContainer: {
        marginVertical: 10,
        alignItems: 'center',
        width: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        marginBottom: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    infoItem: {
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 8,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '800',
    },
    section: {
        width: '100%',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: 1,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    actionText: {
        fontSize: 15,
        marginLeft: 10,
        flex: 1,
        lineHeight: 20,
    },
});
