import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { TemplatesScreen } from '../screens/TemplatesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BuilderStack } from './BuilderStack';
import { PlayerStack } from './PlayerStack';
import { PatientStack } from './PatientStack';
import { useTheme } from '../hooks/useTheme';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { ToastComponent } from '../components/shared/Toast';

export type RootStackParamList = {
    MainTabs: undefined;
    Settings: undefined;
};

export type TabParamList = {
    Home: undefined;
    Patients: undefined;
    Builder: undefined;
    Triage: { flowchartId?: string };
    History: undefined;
    Templates: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.tabActive,
                tabBarInactiveTintColor: colors.tabInactive,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopColor: colors.tabBarBorder,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName: any;

                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Patients') iconName = 'account-group';
                    else if (route.name === 'Builder') iconName = 'tools';
                    else if (route.name === 'Triage') iconName = 'heart-pulse';
                    else if (route.name === 'History') iconName = 'history';
                    else if (route.name === 'Templates') iconName = 'view-grid-outline';

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Patients" component={PatientStack} />
            <Tab.Screen name="Builder" component={BuilderStack} />
            <Tab.Screen name="Triage" component={PlayerStack} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Templates" component={TemplatesScreen} />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    return (
        <ErrorBoundary>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={TabNavigator} />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{ presentation: 'modal' }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
            <ToastComponent />
        </ErrorBoundary>
    );
};
