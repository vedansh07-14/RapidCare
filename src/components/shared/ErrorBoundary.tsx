import * as React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private handleRestart = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            // Fallback if Updates.reloadAsync fails
            this.setState({ hasError: false, error: null, errorInfo: null });
        }
    };

    private handleExportLog = async () => {
        const { error, errorInfo } = this.state;
        if (!error) return;

        const logContent = `
      Error: ${error.toString()}
      Stack: ${error.stack}
      Component Stack: ${errorInfo?.componentStack}
      Device Time: ${new Date().toISOString()}
    `;

        const fileUri = `${FileSystem.cacheDirectory}error_log_${Date.now()}.txt`;

        try {
            await FileSystem.writeAsStringAsync(fileUri, logContent);
            await Sharing.shareAsync(fileUri);
        } catch (e) {
            console.error('Failed to export error log', e);
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <MaterialCommunityIcons name="alert-octagon" size={80} color="#C62828" />
                        <Text style={styles.title}>
                            {this.props.fallbackTitle || 'Something went wrong'}
                        </Text>
                        <Text style={styles.message}>
                            An unexpected error occurred in the application. We recommend restarting.
                        </Text>

                        <ScrollView style={styles.errorScroll} contentContainerStyle={styles.errorScrollContent}>
                            <Text style={styles.errorText}>
                                {this.state.error?.toString()}
                            </Text>
                            {__DEV__ && (
                                <Text style={styles.stackText}>
                                    {this.state.errorInfo?.componentStack}
                                </Text>
                            )}
                        </ScrollView>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, styles.restartButton]}
                                onPress={this.handleRestart}
                            >
                                <Text style={styles.buttonText}>Restart App</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.logButton]}
                                onPress={this.handleExportLog}
                            >
                                <Text style={[styles.buttonText, styles.logButtonText]}>Export Error Log</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6FA',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A2E',
        marginTop: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#5A6478',
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 22,
    },
    errorScroll: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginTop: 24,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#E0E4EF',
    },
    errorScrollContent: {
        padding: 12,
    },
    errorText: {
        color: '#C62828',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    stackText: {
        color: '#5A6478',
        fontSize: 12,
        marginTop: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    actions: {
        width: '100%',
        marginTop: 32,
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    restartButton: {
        backgroundColor: '#1A237E',
    },
    logButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#1A237E',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    logButtonText: {
        color: '#1A237E',
    },
});
