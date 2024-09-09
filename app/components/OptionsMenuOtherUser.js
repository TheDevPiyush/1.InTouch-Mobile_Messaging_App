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
    const reactions = {
        laugh: '😂',
        smile: '😁',
        cry: '😭',
        like: '👍',
        heart: '❤',
        anger: '😡'
    }

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

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, marginTop: 3, paddingTop: 3 }}>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onOptionSelect('like')} >
                                <Text style={{ fontSize: 20 }}>{reactions.like}</Text>
                            </TouchableOpacity >
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onOptionSelect('heart')} >
                                <Text style={{ fontSize: 20 }}>{reactions.heart}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onOptionSelect('smile')} >
                                <Text style={{ fontSize: 20 }}>{reactions.smile}</Text>
                            </TouchableOpacity >
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onOptionSelect('laugh')} >
                                <Text style={{ fontSize: 20 }}>{reactions.laugh}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onOptionSelect('cry')} >
                                <Text style={{ fontSize: 20 }}>{reactions.cry}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.6} onPress={() => onOptionSelect('anger')} >
                                <Text style={{ fontSize: 20 }}>{reactions.anger}</Text>
                            </TouchableOpacity>

                        </View>
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.3)'
    },
    optionText: {
        color: '#FF8C00',
        fontFamily: 'Outfit-Black-Medium',
        fontSize: 17
    }
});

export default OptionsMenuOtherUser;
