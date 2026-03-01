import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useFlowchartStore } from '../store/flowchartStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { RiskBadge } from '../components/shared/RiskBadge';
import { EdgeEditorModal } from '../components/builder/EdgeEditorModal';
import { BuilderStackParamList } from '../navigation/BuilderStack';
import { FlowNode, FlowNodeSchema, NodeOption, NodeType, RiskLevel, Priority } from '../types';
import { NODE_TYPES } from '../constants/nodeTypes';
import { Toast } from '../components/shared/Toast';

type NavigationProp = NativeStackNavigationProp<BuilderStackParamList, 'NodeDetail'>;
type ScreenRouteProp = RouteProp<BuilderStackParamList, 'NodeDetail'>;

const NODE_TYPES_ARRAY = Object.values(NODE_TYPES);
const RISK_LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low', 'safe'];
const PRIORITIES: Priority[] = ['immediate', 'urgent', 'delayed', 'minimal', 'expectant'];

export const NodeDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { flowchartId, nodeId } = route.params;
    const { colors, isDark } = useTheme();

    const flowchart = useFlowchartStore(state => state.flowcharts[flowchartId]);
    const updateNode = useFlowchartStore(state => state.updateNode);
    const deleteNode = useFlowchartStore(state => state.deleteNode);

    const node = flowchart?.nodes[nodeId];

    const [edgeModalVisible, setEdgeModalVisible] = useState(false);
    const [editingOption, setEditingOption] = useState<Partial<NodeOption> | undefined>(undefined);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FlowNode>({
        resolver: zodResolver(FlowNodeSchema),
        defaultValues: node || {
            id: nodeId,
            type: 'question',
            title: '',
            description: '',
            options: [],
        },
    });

    const nodeType = watch('type');
    const options = watch('options') || [];

    // Auto-save on change (debounced or on blur/unmount)
    const onSave = (data: FlowNode) => {
        updateNode(flowchartId, nodeId, data);
    };

    useEffect(() => {
        const subscription = watch((value) => onSave(value as FlowNode));
        return () => subscription.unsubscribe();
    }, [watch]);

    const handleAddOption = () => {
        setEditingOption(undefined);
        setEdgeModalVisible(true);
    };

    const handleEditOption = (option: NodeOption) => {
        setEditingOption(option);
        setEdgeModalVisible(true);
    };

    const handleSaveOption = (option: NodeOption) => {
        if (editingOption?.id) {
            const newOptions = options.map(o => o.id === option.id ? option : o);
            setValue('options', newOptions);
        } else {
            const newOptions = [...options, { ...option, id: Math.random().toString(36).substr(2, 9) }];
            setValue('options', newOptions);
        }
    };

    const handleDeleteOption = (id: string) => {
        setValue('options', options.filter(o => o.id !== id));
    };

    if (!flowchart || !node) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Edit Node"
                subtitle={node.title}
                leftIcon="chevron-left"
                onLeftPress={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>GENERAL</Text>

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Node Type</Text>
                        <View style={styles.typeSelector}>
                            {NODE_TYPES_ARRAY.map(type => (
                                <TouchableOpacity
                                    key={type.type}
                                    onPress={() => {
                                        if (node.type === 'start' && type.type !== 'start') {
                                            const otherStarts = Object.values(flowchart.nodes).filter(n => n.id !== nodeId && n.type === 'start');
                                            if (otherStarts.length === 0) {
                                                Alert.alert('Cannot Change Type', 'Protocols must have at least one start node.');
                                                return;
                                            }
                                        }
                                        setValue('type', type.type);
                                    }}
                                    style={[
                                        styles.typeItem,
                                        {
                                            backgroundColor: nodeType === type.type ? colors.primary + '20' : colors.surface,
                                            borderColor: nodeType === type.type ? colors.primary : colors.border
                                        }
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={type.icon as any}
                                        size={20}
                                        color={nodeType === type.type ? colors.primary : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.typeText,
                                        { color: nodeType === type.type ? colors.primary : colors.textSecondary }
                                    ]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Controller
                            control={control}
                            name="title"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Title"
                                    placeholder="What is the question/step?"
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.title?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Description / Instruction"
                                    placeholder="Provide more detail for the user..."
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    numberOfLines={3}
                                />
                            )}
                        />
                    </View>

                    {nodeType === 'end' && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>OUTCOME SETTINGS</Text>

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Risk Level</Text>
                            <View style={styles.riskSelector}>
                                {RISK_LEVELS.map(level => (
                                    <TouchableOpacity
                                        key={level}
                                        onPress={() => setValue('riskLevel', level)}
                                        style={[
                                            styles.riskItem,
                                            {
                                                backgroundColor: watch('riskLevel') === level ? colors.surfaceElevated : colors.surface,
                                            }
                                        ]}
                                    >
                                        <RiskBadge level={level} size="medium" style={{ opacity: watch('riskLevel') === level ? 1 : 0.4 }} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Triage Priority</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prioritySelector}>
                                {PRIORITIES.map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        onPress={() => setValue('priority', p)}
                                        style={[
                                            styles.priorityItem,
                                            {
                                                backgroundColor: watch('priority') === p ? colors.primary + '20' : colors.surface,
                                                borderColor: watch('priority') === p ? colors.primary : colors.border
                                            }
                                        ]}
                                    >
                                        <Text style={[styles.priorityText, { color: watch('priority') === p ? colors.primary : colors.textSecondary }]}>
                                            {p.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {nodeType !== 'end' && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>OPTIONS / EDGES</Text>
                                <TouchableOpacity onPress={handleAddOption}>
                                    <Text style={{ color: colors.primary, fontWeight: '700' }}>+ Add Option</Text>
                                </TouchableOpacity>
                            </View>

                            {options.length === 0 ? (
                                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No options defined for this node.</Text>
                            ) : (
                                options.map((opt, i) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[styles.optionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={() => handleEditOption(opt)}
                                    >
                                        <View style={styles.optionContent}>
                                            <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                                            <Text style={[styles.optionTarget, { color: colors.textTertiary }]}>
                                                → {flowchart.nodes[opt.targetNodeId]?.title || 'Unknown Node'}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteOption(opt.id)}>
                                            <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}

                    <Button
                        title="Delete Node"
                        variant="danger"
                        outline
                        onPress={() => {
                            Alert.alert('Delete Node', 'Are you sure?', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete', style: 'destructive', onPress: () => {
                                        if (node.type === 'start') {
                                            const otherStarts = Object.values(flowchart.nodes).filter(n => n.id !== nodeId && n.type === 'start');
                                            if (otherStarts.length === 0) {
                                                Alert.alert('Cannot Delete', 'Protocols must have at least one start node.');
                                                return;
                                            }
                                        }
                                        deleteNode(flowchartId, nodeId);
                                        navigation.goBack();
                                    }
                                }
                            ]);
                        }}
                        style={styles.deleteBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <EdgeEditorModal
                visible={edgeModalVisible}
                onClose={() => setEdgeModalVisible(false)}
                onSave={handleSaveOption}
                initialData={editingOption}
                availableNodes={Object.values(flowchart.nodes).filter(n => n.id !== nodeId)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    typeItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    riskSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    riskItem: {
        padding: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    prioritySelector: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    priorityItem: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '800',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    optionTarget: {
        fontSize: 12,
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 13,
        fontStyle: 'italic',
        padding: 20,
    },
    deleteBtn: {
        marginTop: 20,
    },
});
