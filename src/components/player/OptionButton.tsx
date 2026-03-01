import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface OptionButtonProps {
    label: string;
    onPress: () => void;
    color?: string;
    index: number;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
    label,
    onPress,
    color,
    index,
}) => {
    const { colors } = useTheme();

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    // Default color logic based on common answers
    const getButtonColor = () => {
        if (color) return color;
        const lower = label.toLowerCase();
        if (lower === 'yes' || lower === 'true' || lower === 'mild') return colors.success;
        if (lower === 'no' || lower === 'false' || lower === 'severe' || lower === 'critical') return colors.critical;
        if (lower === 'moderate' || lower === 'uncertain') return colors.warning;

        // Cycle through primary shades if no match
        const palettes = [colors.primary, colors.primaryLight, colors.accent, colors.info];
        return palettes[index % palettes.length];
    };

    const btnColor = getButtonColor();

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.container, { backgroundColor: btnColor, shadowColor: btnColor }]}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 64,
        borderRadius: 12,
        marginBottom: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
});
