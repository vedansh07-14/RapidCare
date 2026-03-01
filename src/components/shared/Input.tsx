import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TextInputProps,
    ViewStyle,
    TextStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    inputStyle,
    leftElement,
    rightElement,
    ...props
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: error ? colors.error : colors.border,
                        borderWidth: 1,
                    },
                ]}
            >
                {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
                <TextInput
                    style={[
                        styles.input,
                        { color: colors.text },
                        inputStyle,
                    ]}
                    placeholderTextColor={colors.placeholder}
                    {...props}
                />
                {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
            </View>
            {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        minHeight: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    leftElement: {
        marginRight: 8,
    },
    rightElement: {
        marginLeft: 8,
    },
});
