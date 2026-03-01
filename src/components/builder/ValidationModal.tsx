import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { ValidationResult } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface ValidationModalProps {
    visible: boolean;
    onClose: () => void;
    result: ValidationResult | null;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
    visible,
    onClose,
    result,
}) => {
    const { colors } = useTheme();

    if (!result) return null;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title="Protocol Validation"
            footer={<Button title="Done" onPress={onClose} />}
        >
            <View style={styles.container}>
                <View style={[styles.statusHeader, { backgroundColor: result.isValid ? colors.success + '20' : colors.error + '20' }]}>
                    <MaterialCommunityIcons
                        name={result.isValid ? 'check-decagram' : 'alert-decagram'}
                        size={32}
                        color={result.isValid ? colors.success : colors.error}
                    />
                    <Text style={[styles.statusTitle, { color: result.isValid ? colors.success : colors.error }]}>
                        {result.isValid ? 'Valid Protocol' : 'Issues Found'}
                    </Text>
                </View>

                <ScrollView style={styles.list}>
                    {result.errors.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.error }]}>Errors ({result.errors.length})</Text>
                            {result.errors.map((error, i) => (
                                <View key={`err-${i}`} style={styles.item}>
                                    <MaterialCommunityIcons name="close-circle-outline" size={16} color={colors.error} />
                                    <Text style={[styles.itemText, { color: colors.text }]}>{error.message}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {result.warnings.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.warning }]}>Warnings ({result.warnings.length})</Text>
                            {result.warnings.map((warning, i) => (
                                <View key={`warn-${i}`} style={styles.item}>
                                    <MaterialCommunityIcons name="alert-outline" size={16} color={colors.warning} />
                                    <Text style={[styles.itemText, { color: colors.text }]}>{warning.message}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {result.isValid && result.warnings.length === 0 && (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            This protocol is fully valid and ready for use.
                        </Text>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 4,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
    },
    list: {
        maxHeight: 300,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        paddingLeft: 4,
    },
    itemText: {
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginVertical: 20,
    },
});
