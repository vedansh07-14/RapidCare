import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const { colors } = useTheme();

    const handlePress = () => {
        if (disabled || loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    container: { backgroundColor: colors.primary },
                    text: { color: colors.white },
                };
            case 'secondary':
                return {
                    container: { backgroundColor: colors.accent },
                    text: { color: colors.white },
                };
            case 'outline':
                return {
                    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
                    text: { color: colors.primary },
                };
            case 'ghost':
                return {
                    container: { backgroundColor: 'transparent' },
                    text: { color: colors.primary },
                };
            case 'danger':
                return {
                    container: { backgroundColor: colors.critical },
                    text: { color: colors.white },
                };
            default:
                return {
                    container: { backgroundColor: colors.primary },
                    text: { color: colors.white },
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { container: { paddingVertical: 6, paddingHorizontal: 12 }, text: { fontSize: 13 } };
            case 'medium':
                return { container: { paddingVertical: 12, paddingHorizontal: 20 }, text: { fontSize: 16 } };
            case 'large':
                return { container: { paddingVertical: 16, paddingHorizontal: 24 }, text: { fontSize: 18 } };
            default:
                return { container: { paddingVertical: 12, paddingHorizontal: 20 }, text: { fontSize: 16 } };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            style={[
                styles.container,
                variantStyles.container,
                sizeStyles.container,
                disabled && styles.disabled,
                style,
            ]}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator color={variantStyles.text.color} size="small" />
                ) : (
                    <>
                        {icon && (
                            /* @ts-ignore */
                            <MaterialCommunityIcons
                                name={icon}
                                size={size === 'small' ? 16 : 20}
                                color={variantStyles.text.color}
                                style={styles.icon}
                            />
                        )}
                        <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
                            {title}
                        </Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    icon: {
        marginRight: 8,
    },
    disabled: {
        opacity: 0.5,
    },
});
