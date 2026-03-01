import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlowNode } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { NODE_TYPES } from '../../constants/nodeTypes';

interface QuestionCardProps {
    node: FlowNode;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ node }) => {
    const { colors } = useTheme();
    const config = NODE_TYPES[node.type];

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
                <View style={[styles.iconBadge, { backgroundColor: colors[config.colorKey as keyof typeof colors] as string + '20' }]}>
                    {/* @ts-ignore */}
                    <MaterialCommunityIcons name={config.icon} size={28} color={colors[config.colorKey]} />
                </View>
                <Text style={[styles.typeLabel, { color: colors.textTertiary }]}>
                    {config.label.toUpperCase()}
                </Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
                {node.title}
            </Text>

            {node.description ? (
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {node.description}
                </Text>
            ) : null}

            {node.notes ? (
                <View style={[styles.notesBox, { backgroundColor: colors.background }]}>
                    <MaterialCommunityIcons name="information-outline" size={16} color={colors.textTertiary} />
                    <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                        {node.notes}
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        width: '100%',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    notesBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        alignItems: 'flex-start',
    },
    notesText: {
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
});
