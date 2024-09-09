import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Alert, View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFonts } from 'expo-font';
import { doc, getDoc, updateDoc, onSnapshot, writeBatch, getDocs, collection } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const RightSideMenu = ({ currentUserUID, chatID, searchedUserUID, username }) => {
    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [blockStatus, setBlockStatus] = useState({
        currentUserBlocked: false,
        otherUserBlocked: false,
    });

    useEffect(() => {
        if (chatID) {
            const chatDocRef = doc(firestore, 'Chats', chatID);
            const BlockUnsubscribe = onSnapshot(chatDocRef, (chatDocSnap) => {
                if (chatDocSnap.exists()) {
                    const blockData = chatDocSnap.data().Block || {};
                    setBlockStatus({
                        currentUserBlocked: blockData[currentUserUID],
                        otherUserBlocked: blockData[searchedUserUID],
                    });
                }
            });

            return () => {
                BlockUnsubscribe();
            };
        }
    }, [chatID, currentUserUID]);

    const toggleBlockStatus = async () => {
        const chatDocRef = doc(firestore, "Chats", chatID);

        const chatDocSnap = await getDoc(chatDocRef);
        if (chatDocSnap.exists()) {
            const blockData = chatDocSnap.data().Block || {};

            if (blockData[currentUserUID]) {
                await updateDoc(chatDocRef, {
                    [`Block.${currentUserUID}`]: false
                });
            } else {
                await updateDoc(chatDocRef, {
                    [`Block.${currentUserUID}`]: true
                });
            }
        }
    };

    const deleteMessagesSubcollection = async () => {
        try {
            const chatMessagesRef = collection(firestore, 'Chats', chatID, 'Messages');
            const querySnapshot = await getDocs(chatMessagesRef);

            const batch = writeBatch(firestore);

            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            Alert.alert('Messages Deleted Successfully', "Entire conversation has been deleted for the both users.")
        } catch (err) {
            console.log(err);
        }
    };

    const handleMenuSelect = (value) => {
        setShowModal(false);
        switch (value) {
            case 'option1':
                toggleBlockStatus();
                break;
            case 'option2':
                Alert.alert('Delete Entire Conversation?', `This will delete the entire conversation for you and ${username} both permanently?`, [
                    {
                        text: "Delete Anyway",
                        onPress: () => { deleteMessagesSubcollection(); },
                        style: 'destructive'
                    },
                    {
                        text: "Cancel",
                        style: 'cancel'
                    },
                ]);
                break;
            default:
                break;
        }
    };

    if (!loaded) return null;

    return (
        <View>
            <TouchableOpacity
                style={{ paddingRight: 15 }}
                onPress={() => setShowModal(true)}
            >
                <Ionicons name='ellipsis-vertical' size={20} color='#ff9301' />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
                    <View style={styles.modalContainer}>

                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleMenuSelect('option1')}>
                            <View style={styles.btnContainer}>
                                <FontAwesome5 name="user-slash" size={15} color="#ff9301" />
                                <Text style={[styles.textColor]}>{blockStatus.currentUserBlocked ? "Unblock" : 'Block'}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleMenuSelect('option2')}>
                            <View style={styles.btnContainer}>
                                <Ionicons name='trash-bin' size={20} color='#ff9301' />
                                <Text style={[styles.textColor]}>Delete Entire Conversation</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#171722',
        borderRadius: 10,
        padding: 15,
        width: '80%',
    },
    btnContainer: {
        paddingHorizontal: 10,
        paddingVertical: 15,
        flexDirection: 'row',
        backgroundColor: '#1f1f2d',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 5,
        borderRadius: 5,
    },
    textColor: {
        color: '#ff9301',
        fontSize: 14,
        width: 'auto',
        fontFamily: 'Outfit-Black-Medium',
        marginLeft: 10,
    },
});

export default RightSideMenu;
