import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientsScreen } from '../screens/PatientsScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';

export type PatientStackParamList = {
    PatientsList: undefined;
    PatientDetail: { patientId: string };
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export const PatientStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PatientsList" component={PatientsScreen} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
        </Stack.Navigator>
    );
};
