import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useFlowchartStore } from '../store/flowchartStore';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/shared/Header';
import { TEMPLATES } from '../constants/templates';
import { Flowchart } from '../types';
import { FlowchartPreview } from '../components/builder/FlowchartPreview';
import { Button } from '../components/shared/Button';
import { Toast } from '../components/shared/Toast';

export const TemplatesScreen = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();

    const importFlowchart = useFlowchartStore(state => state.importFlowchart);

    const handleImport = (template: Flowchart) => {
        Alert.alert(
            'Import Template',
            `Add "${template.name}" to your protocols?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Import',
                    onPress: () => {
                        const newId = importFlowchart(template);
                        Toast.show({ message: 'Protocol imported', type: 'success' });
                        navigation.navigate('Builder', {
                            screen: 'BuilderEditor',
                            params: { flowchartId: newId }
                        });
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Flowchart }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.previewContainer}>
                <FlowchartPreview flowchart={item} width={100} height={100} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                    {item.description}
                </Text>
                <View style={styles.cardFooter}>
                    <Text style={[styles.cardMeta, { color: colors.textTertiary }]}>
                        {Object.keys(item.nodes).length} nodes
                    </Text>
                    <Button
                        title="Import"
                        onPress={() => handleImport(item)}
                        size="small"
                        icon="download"
                    />
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Medical Templates" subtitle="Verified clinical protocols" />
            <FlashList
                data={TEMPLATES}
                renderItem={renderItem}
                estimatedItemSize={180}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    previewContainer: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    cardDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardMeta: {
        fontSize: 12,
        fontWeight: '600',
    },
});
