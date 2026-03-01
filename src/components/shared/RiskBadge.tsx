import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RiskLevel } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { getRiskColor, getRiskBgColor, getRiskLabel, getRiskIcon } from '../../utils/riskUtils';

interface RiskBadgeProps {
    level: RiskLevel;
    showIcon?: boolean;
    size?: 'small' | 'medium';
    style?: ViewStyle;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
    level,
    showIcon = true,
    size = 'small',
    style,
}) => {
    const { isDark } = useTheme();

    const color = getRiskColor(level, isDark);
    const bgColor = getRiskBgColor(level, isDark);
    const label = getRiskLabel(level);
    const iconName = getRiskIcon(level);

    return (
        <View style={[
            styles.container,
            { backgroundColor: bgColor, borderColor: color },
            size === 'small' ? styles.small : styles.medium,
            style
        ]}>
            {showIcon && (
                /* @ts-ignore */
                <MaterialCommunityIcons
                    name={iconName}
                    size={size === 'small' ? 14 : 18}
                    color={color}
                    style={styles.icon}
                />
            )}
            <Text style={[
                styles.text,
                { color: color },
                size === 'small' ? styles.smallText : styles.mediumText
            ]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
    },
    small: {
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    medium: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    icon: {
        marginRight: 4,
    },
    text: {
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    smallText: {
        fontSize: 10,
    },
    mediumText: {
        fontSize: 12,
    },
});
