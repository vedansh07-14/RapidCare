import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    actionTitle?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    actionTitle,
    onAction,
    style,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            {/* @ts-ignore */}
            <MaterialCommunityIcons name={icon} size={64} color={colors.placeholder} style={styles.icon} />
            <Text style={[styles.title, { color: colors.text }]}>
                {title}
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
                {message}
            </Text>
            {actionTitle && onAction && (
                <Button
                    title={actionTitle}
                    onPress={onAction}
                    variant="outline"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    button: {
        minWidth: 160,
    },
});
