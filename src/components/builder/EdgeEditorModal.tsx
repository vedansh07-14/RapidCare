import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { NodeOption, NodeOptionSchema, FlowNode } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface EdgeEditorModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (option: NodeOption) => void;
    initialData?: Partial<NodeOption>;
    availableNodes: FlowNode[];
}

export const EdgeEditorModal: React.FC<EdgeEditorModalProps> = ({
    visible,
    onClose,
    onSave,
    initialData,
    availableNodes,
}) => {
    const { colors } = useTheme();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<NodeOption>({
        resolver: zodResolver(NodeOptionSchema),
        defaultValues: {
            id: initialData?.id || '',
            label: initialData?.label || '',
            targetNodeId: initialData?.targetNodeId || '',
            condition: initialData?.condition || '',
            color: initialData?.color || '',
        },
    });

    useEffect(() => {
        if (visible) {
            reset({
                id: initialData?.id || '',
                label: initialData?.label || '',
                targetNodeId: initialData?.targetNodeId || '',
                condition: initialData?.condition || '',
                color: initialData?.color || '',
            });
        }
    }, [visible, initialData, reset]);

    const onSubmit = (data: NodeOption) => {
        onSave(data);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={initialData?.id ? 'Edit Option' : 'Add Option'}
            footer={
                <View style={styles.footer}>
                    <Button title="Cancel" variant="ghost" onPress={onClose} style={{ marginRight: 12 }} />
                    <Button title="Save Option" onPress={handleSubmit(onSubmit)} />
                </View>
            }
        >
            <ScrollView>
                <Controller
                    control={control}
                    name="label"
                    render={({ field: { onChange, value } }) => (
                        <Input
                            label="Option Label (e.g., 'Yes', 'Severe')"
                            placeholder="Enter button text"
                            value={value}
                            onChangeText={onChange}
                            error={errors.label?.message}
                        />
                    )}
                />

                <Text style={[styles.label, { color: colors.textSecondary }]}>Target Node</Text>
                <ScrollView style={styles.nodePicker} nestedScrollEnabled>
                    {availableNodes.map(node => (
                        <Controller
                            key={node.id}
                            control={control}
                            name="targetNodeId"
                            render={({ field: { onChange, value } }) => (
                                <TouchableOpacity
                                    onPress={() => onChange(node.id)}
                                    style={[
                                        styles.nodeOption,
                                        {
                                            backgroundColor: value === node.id ? colors.primary + '20' : 'transparent',
                                            borderColor: value === node.id ? colors.primary : colors.border
                                        }
                                    ]}
                                >
                                    <Text style={[styles.nodeTitle, { color: colors.text }]}>{node.title}</Text>
                                    <Text style={[styles.nodeType, { color: colors.textTertiary }]}>{node.type.toUpperCase()}</Text>
                                    {value === node.id && (
                                        <View style={styles.checkIcon}>
                                            <Text style={{ color: colors.primary }}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    ))}
                </ScrollView>
                {errors.targetNodeId && (
                    <Text style={[styles.errorText, { color: colors.error }]}>{errors.targetNodeId.message}</Text>
                )}

                <Controller
                    control={control}
                    name="condition"
                    render={({ field: { onChange, value } }) => (
                        <Input
                            label="Internal Condition (Optional)"
                            placeholder="Helper text for this logic"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    nodePicker: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginBottom: 16,
    },
    nodeOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    nodeTitle: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    nodeType: {
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 8,
    },
    checkIcon: {
        marginLeft: 8,
    },
    errorText: {
        fontSize: 12,
        marginBottom: 16,
        marginLeft: 4,
    },
});
