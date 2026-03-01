import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SessionStep } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface PathTimelineProps {
    steps: SessionStep[];
}

export const PathTimeline: React.FC<PathTimelineProps> = ({ steps }) => {
    const { colors } = useTheme();

    if (steps.length === 0) return null;

    return (
        <View style={styles.container}>
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                return (
                    <View key={`${step.nodeId}-${index}`} style={styles.stepRow}>
                        <View style={styles.timelineColumn}>
                            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                            {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
                        </View>

                        <View style={styles.contentColumn}>
                            <Text style={[styles.nodeTitle, { color: colors.text }]}>
                                {step.nodeTitle}
                            </Text>
                            {step.chosenOptionLabel && (
                                <View style={[styles.optionBadge, { backgroundColor: colors.primary + '10' }]}>
                                    <Text style={[styles.optionLabel, { color: colors.primary }]}>
                                        Selected: {step.chosenOptionLabel}
                                    </Text>
                                </View>
                            )}
                            <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                                {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    stepRow: {
        flexDirection: 'row',
        minHeight: 60,
    },
    timelineColumn: {
        width: 20,
        alignItems: 'center',
        marginRight: 12,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 6,
        zIndex: 1,
    },
    line: {
        width: 2,
        flex: 1,
        marginTop: -4,
    },
    contentColumn: {
        flex: 1,
        paddingBottom: 20,
    },
    nodeTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    optionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    optionLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 10,
    },
});
