import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert,
    Share
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useFlowchartStore } from '../store/flowchartStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { EmptyState } from '../components/shared/EmptyState';
import { FlowchartPreview } from '../components/builder/FlowchartPreview';
import { BuilderStackParamList } from '../navigation/BuilderStack';
import { Flowchart } from '../types';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { Input } from '../components/shared/Input';
import { Toast } from '../components/shared/Toast';

type NavigationProp = NativeStackNavigationProp<BuilderStackParamList, 'BuilderList'>;

export const BuilderListScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();

    const flowcharts = useFlowchartStore(state => Object.values(state.flowcharts));
    const createFlowchart = useFlowchartStore(state => state.createFlowchart);
    const deleteFlowchart = useFlowchartStore(state => state.deleteFlowchart);
    const duplicateFlowchart = useFlowchartStore(state => state.duplicateFlowchart);

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const handleCreate = () => {
        if (!newName.trim()) {
            Toast.show({ message: 'Please enter a name', type: 'error' });
            return;
        }
        const id = createFlowchart(newName, newDesc, 'Me');
        setCreateModalVisible(false);
        setNewName('');
        setNewDesc('');
        navigation.navigate('BuilderEditor', { flowchartId: id });
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Protocol',
            `Are you sure you want to delete "${name}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteFlowchart(id);
                        Toast.show({ message: 'Protocol deleted', type: 'success' });
                    }
                },
            ]
        );
    };

    const handleDuplicate = (id: string, name: string) => {
        const newId = duplicateFlowchart(id, `${name} (Copy)`);
        Toast.show({ message: 'Protocol duplicated', type: 'success' });
        navigation.navigate('BuilderEditor', { flowchartId: newId });
    };

    const renderItem = ({ item }: { item: Flowchart }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('BuilderEditor', { flowchartId: item.id })}
        >
            <View style={styles.cardPreview}>
                <FlowchartPreview flowchart={item} width={80} height={80} />
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    {item.isPublished && (
                        <View style={[styles.publishedBadge, { backgroundColor: colors.success + '20' }]}>
                            <Text style={[styles.publishedText, { color: colors.success }]}>Published</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.description || 'No description provided.'}
                </Text>
                <View style={styles.cardFooter}>
                    <Text style={[styles.cardMeta, { color: colors.textTertiary }]}>
                        {Object.keys(item.nodes).length} nodes • v{item.version}
                    </Text>
                    <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => handleDuplicate(item.id, item.name)} style={styles.actionButton}>
                            <MaterialCommunityIcons name="content-copy" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionButton}>
                            <MaterialCommunityIcons name="delete-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Protocols"
                subtitle={`${flowcharts.length} available`}
                rightIcon="plus"
                onRightPress={() => setCreateModalVisible(true)}
            />

            <View style={styles.listContainer}>
                <FlashList
                    data={flowcharts}
                    renderItem={renderItem}
                    estimatedItemSize={120}
                    ListEmptyComponent={
                        <EmptyState
                            icon="file-plus-outline"
                            title="No Protocols Yet"
                            message="Create your first medical triage protocol to get started."
                            actionTitle="Create Protocol"
                            onAction={() => setCreateModalVisible(true)}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            </View>

            <Modal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                title="Create New Protocol"
                footer={
                    <View style={styles.modalFooter}>
                        <Button
                            title="Cancel"
                            variant="ghost"
                            onPress={() => setCreateModalVisible(false)}
                            style={{ marginRight: 12 }}
                        />
                        <Button
                            title="Create"
                            onPress={handleCreate}
                        />
                    </View>
                }
            >
                <Input
                    label="Protocol Name"
                    placeholder="e.g., Asthma Triage"
                    value={newName}
                    onChangeText={setNewName}
                    autoFocus
                />
                <Input
                    label="Description"
                    placeholder="Briefly describe what this protocol assesses..."
                    value={newDesc}
                    onChangeText={setNewDesc}
                    multiline
                    numberOfLines={3}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardPreview: {
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#eee',
        padding: 10,
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    publishedBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    publishedText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardMeta: {
        fontSize: 11,
    },
    cardActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 4,
        marginLeft: 8,
    },
    modalFooter: {
        flexDirection: 'row',
    }
});
