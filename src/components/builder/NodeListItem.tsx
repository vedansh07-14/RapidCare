import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { FlowNode } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { NODE_TYPES } from '../../constants/nodeTypes';
import { RiskBadge } from '../shared/RiskBadge';

interface NodeListItemProps extends RenderItemParams<FlowNode> {
    onPress: (node: FlowNode) => void;
    onDelete: (id: string) => void;
}

export const NodeListItem: React.FC<NodeListItemProps> = ({
    item,
    drag,
    isActive,
    onPress,
    onDelete,
}) => {
    const { colors } = useTheme();
    const config = NODE_TYPES[item.type];

    return (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                onPress={() => onPress(item)}
                style={[
                    styles.container,
                    {
                        backgroundColor: isActive ? colors.surfaceElevated : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                        shadowColor: isActive ? '#000' : 'transparent',
                    },
                    isActive && styles.activeShadow
                ]}
            >
                <View style={[styles.typeIndicator, { backgroundColor: colors[config.colorKey as keyof typeof colors] as string || colors.primary }]} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        {/* @ts-ignore */}
                        <MaterialCommunityIcons name={config.icon} size={20} color={colors.textSecondary} />
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.meta, { color: colors.textTertiary }]}>
                            {item.options.length} {item.options.length === 1 ? 'option' : 'options'}
                        </Text>
                        {item.type === 'start' && (
                            <View style={[styles.startBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.startBadgeText}>START</Text>
                            </View>
                        )}
                        {item.type === 'end' && item.riskLevel && (
                            <RiskBadge level={item.riskLevel} size="small" />
                        )}
                    </View>
                </View>

                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
                </TouchableOpacity>

                <View style={styles.dragHandle}>
                    <MaterialCommunityIcons name="drag-vertical" size={24} color={colors.placeholder} />
                </View>
            </TouchableOpacity>
        </ScaleDecorator>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 6,
        overflow: 'hidden',
        height: 72,
    },
    activeShadow: {
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    typeIndicator: {
        width: 6,
        height: '100%',
    },
    content: {
        flex: 1,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    meta: {
        fontSize: 12,
        marginRight: 8,
    },
    startBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    startBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    deleteButton: {
        padding: 12,
    },
    dragHandle: {
        paddingRight: 8,
    },
});
