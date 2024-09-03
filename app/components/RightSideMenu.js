import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Alert, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import Popover from 'react-native-popover-view';
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFonts } from 'expo-font';
import { doc, getDoc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';


const RightSideMenu = ({ currentUserUID, chatID, searchedUserUID, username }) => {

    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });
    const navigation = useNavigation();
    const popoverRef = useRef();
    const [showPopover, setShowPopover] = useState(false);
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
                BlockUnsubscribe()
            }
        }
    }, [chatID, currentUserUID])

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

    const deleteMessagesSubcollection = async (chatID) => {
        const chatMessagesRef = collection(firestore, 'Chats', chatID, 'Messages');
        const querySnapshot = await getDocs(chatMessagesRef);

        const batch = writeBatch(firestore);

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        Alert.alert('Messages deleted successfully');
    };


    const handleMenuSelect = (value) => {
        setShowPopover(false);
        switch (value) {
            case 'option1':
                toggleBlockStatus();
                break;
            case 'option2':
                Alert.alert('Delete Entire Conversation?', `This action is not reversible. This will delete the entire conversation for you and '${username}' both?`);
                break;
            case 'logout':
                Alert.alert('Logout selected');
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
                ref={popoverRef}
                onPress={() => setShowPopover(true)}
            >
                <Ionicons name='ellipsis-vertical' size={20} color='#ff9301' />

            </TouchableOpacity>

            <Popover
                arrowSize={{ width: 0, height: 0 }}
                isVisible={showPopover}
                from={popoverRef}
                onRequestClose={() => setShowPopover(false)}
                placement="bottomStart"
            >
                <TouchableOpacity onPress={() => handleMenuSelect('option1')}>
                    <View style={styles.btnContainer}>
                        <FontAwesome5 name="user-slash" size={15} color="#ff9301" />
                        <Text style={[styles.textColor]}>{blockStatus.currentUserBlocked ? "Unblock" : 'Block'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMenuSelect('option2')}>
                    <View style={styles.btnContainer}>
                        <Ionicons name='trash-bin' size={20} color='#ff9301' />
                        <Text style={[styles.textColor]}>Delete Conversation</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMenuSelect('logout')}>
                    <View style={styles.btnContainer}>
                        <Ionicons name='log-out' size={20} color='#ff9301' />
                        <Text style={[styles.textColor]}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </Popover>
        </View>
    );

};
const styles = StyleSheet.create({
    btnContainer: {
        paddingHorizontal: 10,
        paddingVertical: 13,
        flexDirection: 'row',
        backgroundColor: '#1f1f2d',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 5
    },
    textColor: {
        color: '#ff9301',
        fontSize: 15,
        width: 'auto',
        fontFamily: 'Outfit-Black-Medium'
    }
})

export default RightSideMenu;
