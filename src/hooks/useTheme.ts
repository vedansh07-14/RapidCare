import { useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

export const useTheme = () => {
    const systemColorScheme = useColorScheme();
    const [isManualDark, setIsManualDark] = useState<boolean | null>(null);

    const isDark = isManualDark !== null ? isManualDark : systemColorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const toggleTheme = useCallback(() => {
        setIsManualDark(prev => prev === null ? systemColorScheme !== 'dark' : !prev);
    }, [systemColorScheme]);

    return {
        isDark,
        colors,
        colorScheme: isDark ? ('dark' as const) : ('light' as const),
        toggleTheme,
    };
};
