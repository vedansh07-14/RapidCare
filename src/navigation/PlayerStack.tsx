import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SessionResultScreen } from '../screens/SessionResultScreen';

export type PlayerStackParamList = {
    Player: { flowchartId: string, sessionId?: string };
    SessionResult: { sessionId: string };
};

const Stack = createNativeStackNavigator<PlayerStackParamList>();

export const PlayerStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Player" component={PlayerScreen} />
            <Stack.Screen name="SessionResult" component={SessionResultScreen} />
        </Stack.Navigator>
    );
};
