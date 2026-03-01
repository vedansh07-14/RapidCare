import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../components/shared/Header';
import { useTheme } from '../hooks/useTheme';

export const PlaceholderScreen = ({ name }: { name: string }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title={name} />
            <View style={styles.content}>
                <Text style={{ color: colors.text }}>{name} Placeholder</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
