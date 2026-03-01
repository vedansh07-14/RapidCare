import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    TouchableOpacity
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

export interface ToastRef {
    show: (options: ToastOptions) => void;
    hide: () => void;
}

let toastRef: React.RefObject<ToastRef> | null = null;

export const Toast = {
    show: (options: ToastOptions) => {
        toastRef?.current?.show(options);
    },
    hide: () => {
        toastRef?.current?.hide();
    }
};

export const ToastComponent = forwardRef<ToastRef>((_, ref) => {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<ToastOptions>({ message: '', type: 'info' });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(100)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const hide = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setVisible(false);
        });
    }, [fadeAnim, slideAnim]);

    const show = useCallback((newOptions: ToastOptions) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setOptions({
            type: 'info',
            duration: 3000,
            ...newOptions
        });
        setVisible(true);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        timeoutRef.current = setTimeout(() => {
            hide();
        }, newOptions.duration || 3000);
    }, [fadeAnim, slideAnim, hide]);

    useImperativeHandle(ref, () => ({
        show,
        hide
    }));

    // Assign to global ref
    useEffect(() => {
        // @ts-ignore
        toastRef = { current: { show, hide } };
        return () => { toastRef = null; };
    }, [show, hide]);

    if (!visible) return null;

    const getBackgroundColor = () => {
        switch (options.type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            case 'warning': return colors.warning;
            case 'info': return colors.info;
            default: return colors.surfaceElevated;
        }
    };

    const getIcon = () => {
        switch (options.type) {
            case 'success': return 'check-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'alert';
            case 'info': return 'information';
            default: return 'information';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.content}>
                {/* @ts-ignore */}
                <MaterialCommunityIcons name={getIcon()} size={20} color={colors.white} style={styles.icon} />
                <Text style={[styles.message, { color: colors.white }]}>
                    {options.message}
                </Text>
                <TouchableOpacity onPress={hide} style={styles.closeButton}>
                    <MaterialCommunityIcons name="close" size={16} color={colors.white} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        borderRadius: 8,
        padding: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});
