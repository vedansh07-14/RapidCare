import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useTheme } from './src/hooks/useTheme';
import { useFlowchartStore } from './src/store/flowchartStore';

export default function App() {
  const { isDark } = useTheme();
  const loadTemplates = useFlowchartStore(state => state.loadTemplates);

  useEffect(() => {
    // Load initial templates on app start
    loadTemplates();
  }, [loadTemplates]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
