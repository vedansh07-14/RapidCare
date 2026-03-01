import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal as RNModal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    title,
    children,
    footer,
}) => {
    const { colors } = useTheme();

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={[styles.modalContent, { backgroundColor: colors.surface }]}
                        >
                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                {title && (
                                    <Text style={[styles.title, { color: colors.text }]}>
                                        {title}
                                    </Text>
                                )}
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.body}>
                                {children}
                            </View>

                            {footer && (
                                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                                    {footer}
                                </View>
                            )}
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    body: {
        padding: 16,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
});
