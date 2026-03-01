import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
    title: string;
    subtitle?: string;
    leftIcon?: string;
    onLeftPress?: () => void;
    rightIcon?: string;
    onRightPress?: () => void;
    rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    leftIcon,
    onLeftPress,
    rightIcon,
    onRightPress,
    rightElement,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <SafeAreaView>
                <View style={styles.content}>
                    <View style={styles.left}>
                        {leftIcon && (
                            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                                {/* @ts-ignore */}
                                <MaterialCommunityIcons name={leftIcon} size={24} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.center}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                {subtitle}
                            </Text>
                        )}
                    </View>

                    <View style={styles.right}>
                        {rightElement ? (
                            rightElement
                        ) : (
                            rightIcon && (
                                <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                                    {/* @ts-ignore */}
                                    <MaterialCommunityIcons name={rightIcon} size={24} color={colors.primary} />
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
    },
    content: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    left: {
        width: 48,
        alignItems: 'flex-start',
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    right: {
        width: 48,
        alignItems: 'flex-end',
    },
    iconButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
