import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons'

const OptionsMenuOtherUser = ({ visible, onClose, position, onOptionSelect }) => {
    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View style={[styles.menu, { top: position.y, left: position.x }]}>
                        <TouchableOpacity onPress={() => onOptionSelect('copy')} style={styles.menuItem}>
                            <Ionicons name='copy-outline' size={20} color={'#FF8C00'} />
                            <Text style={styles.optionText}>Copy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onOptionSelect('reply')} style={styles.menuItem}>
                            <Ionicons name='arrow-redo-outline' size={20} color={'#FF8C00'} />
                            <Text style={styles.optionText}>Reply to</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menu: {
        width: 200,
        position: 'absolute',
        backgroundColor: '#1f1f2d',
        borderRadius: 7,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        gap: 6,
        padding: 5,
        alignItems: 'center',
    },
    optionText: {
        color: '#FF8C00',
        fontFamily: 'Outfit-Black-Medium',
        fontSize: 17
    }
});

export default OptionsMenuOtherUser;
