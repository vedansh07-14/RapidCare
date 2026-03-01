import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { useFlowchartStore } from '../store/flowchartStore';
import { useSessionStore } from '../store/sessionStore';
import { Toast } from '../components/shared/Toast';

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { colors, isDark, toggleTheme } = useTheme();

    const flowcharts = useFlowchartStore(state => state.flowcharts);
    const sessions = useSessionStore(state => state.sessions);

    const handleExportAll = async () => {
        const data = {
            flowcharts,
            sessions,
            exportedAt: new Date().toISOString(),
            app: 'TriageFlow',
            version: '1.0.0'
        };

        const fileUri = `${FileSystem.documentDirectory}triageflow_backup.json`;

        try {
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
            await Sharing.shareAsync(fileUri);
        } catch (e) {
            Toast.show({ message: 'Export failed', type: 'error' });
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your custom protocols and assessment history. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        Toast.show({ message: 'All data cleared. Restarting...', type: 'info' });
                        // Simplified: just clear stores
                        useFlowchartStore.setState({ flowcharts: {} });
                        useSessionStore.setState({ sessions: {}, activeSessionId: null });
                    }
                }
            ]
        );
    };

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {children}
            </View>
        </View>
    );

    const SettingRow = ({ icon, label, value, onPress, showSwitch }: { icon: string, label: string, value?: boolean, onPress?: () => void, showSwitch?: boolean }) => (
        <TouchableOpacity
            style={styles.settingRow}
            onPress={onPress}
            disabled={showSwitch}
        >
            <View style={styles.rowLeft}>
                <MaterialCommunityIcons name={icon as any} size={22} color={colors.textSecondary} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
            </View>
            {showSwitch ? (
                <Switch value={value} onValueChange={onPress} />
            ) : (
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Settings"
                leftIcon="close"
                onLeftPress={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Section title="APPEARANCE">
                    <SettingRow
                        icon="theme-light-dark"
                        label="Dark Mode"
                        value={isDark}
                        showSwitch
                        onPress={toggleTheme}
                    />
                </Section>

                <Section title="DATA MANAGEMENT">
                    <SettingRow icon="export-variant" label="Export All Data (JSON)" onPress={handleExportAll} />
                    <SettingRow icon="import" label="Import Data" onPress={() => Toast.show({ message: 'Coming soon', type: 'info' })} />
                    <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
                        <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
                        <Text style={[styles.dangerText, { color: colors.error }]}>Clear All Data</Text>
                    </TouchableOpacity>
                </Section>

                <Section title="ABOUT">
                    <View style={styles.aboutInfo}>
                        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>TriageFlow v1.0.0</Text>
                        <Text style={[styles.aboutText, { color: colors.textTertiary }]}>Professional MedTech Tool</Text>
                        <Text style={[styles.aboutText, { color: colors.textTertiary }]}>Offline-First Engine</Text>
                    </View>
                </Section>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
    },
    sectionContent: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    dangerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    dangerText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    aboutInfo: {
        padding: 16,
        alignItems: 'center',
    },
    aboutText: {
        fontSize: 12,
        marginBottom: 4,
    },
});
