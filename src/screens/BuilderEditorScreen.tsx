import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert,
    SafeAreaView
} from 'react-native';
import DraggableFlatList, {
    RenderItemParams
} from 'react-native-draggable-flatlist';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useFlowchartStore } from '../store/flowchartStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { NodeListItem } from '../components/builder/NodeListItem';
import { ValidationModal } from '../components/builder/ValidationModal';
import { BuilderStackParamList } from '../navigation/BuilderStack';
import { FlowNode, ValidationResult } from '../types';
import { Toast } from '../components/shared/Toast';

type NavigationProp = NativeStackNavigationProp<BuilderStackParamList, 'BuilderEditor'>;
type ScreenRouteProp = RouteProp<BuilderStackParamList, 'BuilderEditor'>;

export const BuilderEditorScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { flowchartId } = route.params;
    const { colors } = useTheme();

    const flowchart = useFlowchartStore(state => state.flowcharts[flowchartId]);
    const updateFlowchart = useFlowchartStore(state => state.updateFlowchart);
    const addNode = useFlowchartStore(state => state.addNode);
    const deleteNode = useFlowchartStore(state => state.deleteNode);
    const reorderNodes = useFlowchartStore(state => state.reorderNodes);
    const validateFlowchart = useFlowchartStore(state => state.validateFlowchart);
    const undo = useFlowchartStore(state => state.undo);
    const redo = useFlowchartStore(state => state.redo);
    const history = useFlowchartStore(state => state.history[flowchartId]);

    const [validationVisible, setValidationVisible] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

    const sortedNodes = useMemo(() => {
        if (!flowchart) return [];
        return Object.values(flowchart.nodes).sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [flowchart]);

    const handleAddNode = () => {
        const id = addNode(flowchartId, {
            type: 'question',
            title: 'New Question',
            description: '',
            options: [],
            order: sortedNodes.length
        });
        // navigation.navigate('NodeDetail', { flowchartId, nodeId: id });
        Toast.show({ message: 'Node added', type: 'info' });
    };

    const handleDragEnd = ({ data }: { data: FlowNode[] }) => {
        reorderNodes(flowchartId, data.map(n => n.id));
    };

    const handleDeleteNode = (nodeId: string) => {
        Alert.alert(
            'Delete Node',
            'Are you sure you want to delete this node and all connections to it?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteNode(flowchartId, nodeId);
                        Toast.show({ message: 'Node deleted', type: 'success' });
                    }
                }
            ]
        );
    };

    const handleValidate = () => {
        const result = validateFlowchart(flowchartId);
        setValidationResult(result);
        setValidationVisible(true);
    };

    const handleRename = () => {
        Alert.prompt(
            'Rename Protocol',
            'Enter a new name for this protocol',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: (name) => {
                        if (name) updateFlowchart(flowchartId, { name });
                    }
                }
            ],
            'plain-text',
            flowchart?.name
        );
    };

    if (!flowchart) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title={flowchart.name}
                onLeftPress={() => navigation.goBack()}
                leftIcon="chevron-left"
                rightElement={
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => undo(flowchartId)}
                            disabled={!history || history.past.length === 0}
                            style={[styles.headerIcon, (!history || history.past.length === 0) && styles.disabledIcon]}
                        >
                            <MaterialCommunityIcons name="undo" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => redo(flowchartId)}
                            disabled={!history || history.future.length === 0}
                            style={[styles.headerIcon, (!history || history.future.length === 0) && styles.disabledIcon]}
                        >
                            <MaterialCommunityIcons name="redo" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleValidate} style={styles.headerIcon}>
                            <MaterialCommunityIcons name="check-all" size={20} color={colors.success} />
                        </TouchableOpacity>
                    </View>
                }
            />

            <DraggableFlatList
                data={sortedNodes}
                onDragEnd={handleDragEnd}
                keyExtractor={(item) => item.id}
                renderItem={(props) => (
                    <NodeListItem
                        {...props}
                        onPress={(node) => navigation.navigate('NodeDetail', { flowchartId, nodeId: node.id })}
                        onDelete={handleDeleteNode}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <TouchableOpacity onPress={handleRename} style={styles.infoBox}>
                        <Text style={[styles.infoTitle, { color: colors.textTertiary }]}>PROTOCOL INFO</Text>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Author: {flowchart.author}</Text>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>v{flowchart.version}</Text>
                        </View>
                    </TouchableOpacity>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={handleAddNode}
            >
                <MaterialCommunityIcons name="plus" size={32} color={colors.white} />
            </TouchableOpacity>

            <ValidationModal
                visible={validationVisible}
                onClose={() => setValidationVisible(false)}
                result={validationResult}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        padding: 8,
        marginLeft: 4,
    },
    disabledIcon: {
        opacity: 0.3,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    infoBox: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    infoTitle: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
});
