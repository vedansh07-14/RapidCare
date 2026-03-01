import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BuilderListScreen } from '../screens/BuilderListScreen';
import { BuilderEditorScreen } from '../screens/BuilderEditorScreen';
import { NodeDetailScreen } from '../screens/NodeDetailScreen';

export type BuilderStackParamList = {
    BuilderList: undefined;
    BuilderEditor: { flowchartId: string };
    NodeDetail: { flowchartId: string, nodeId: string };
};

const Stack = createNativeStackNavigator<BuilderStackParamList>();

export const BuilderStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BuilderList" component={BuilderListScreen} />
            <Stack.Screen name="BuilderEditor" component={BuilderEditorScreen} />
            <Stack.Screen name="NodeDetail" component={NodeDetailScreen} />
        </Stack.Navigator>
    );
};
