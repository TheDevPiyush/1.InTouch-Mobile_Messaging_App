import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { firestore, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from 'expo-router';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootSiblingParent } from 'react-native-root-siblings';

const ChatsTab = () => {
    const [chats, setChats] = useState([]);
    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });
    const [currentUserUID, setcurrentUserUID] = useState(null);
    const [newMessage, setNewMessage] = useState(false);

    const [updateMsg, setUpdateMsg] = useState(null)

    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user.uid) {
                setcurrentUserUID(user.uid)
            }
            else {
                AsyncStorage.setItem("LoggedIn", 'false').catch();
                auth.signOut().catch();
                router.replace('/');
            }
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (!loaded) return null;

        const chatsCollectionRef = collection(firestore, 'Chats');

        const chatsQuery = query(
            chatsCollectionRef,
            where('participants', 'array-contains', currentUserUID)
        );

        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
            const chatsData = [];

            for (const chatDoc of snapshot.docs) {
                const chatID = chatDoc.id;
                const chatData = chatDoc.data();

                const messagesCollectionRef = collection(firestore, 'Chats', chatID, 'Messages');
                const recentMessageQuery = query(messagesCollectionRef, orderBy('timestamp', 'desc'), limit(1));
                const recentMessageUnsubscribe = onSnapshot(recentMessageQuery, (recentMessageSnapshot) => {
                    if (!recentMessageSnapshot.empty) {
                        let recentMessage = null;
                        recentMessageSnapshot.forEach((doc) => {
                            recentMessage = doc.data();
                        });

                        const otherUserUid = recentMessage.from === currentUserUID ? recentMessage.to : recentMessage.from;

                        const userDocRef = doc(firestore, 'Users', otherUserUid);
                        getDoc(userDocRef)
                            .then((userDoc) => {
                                if (userDoc.exists()) {
                                    const userData = userDoc.data();
                                    const username = userData.username;
                                    const userpicture = userData.profilePicUrl
                                    addChatToData(chatID, chatData, recentMessage, username, userpicture);
                                }
                            })
                            .catch((error) => {
                            });
                    }
                });

                chatsData.push({ chatID, ...chatData });
                showUpdateNotice()

            }
        });

        return () => {
            unsubscribe();
        };

    }, [currentUserUID, loaded]);

    useEffect(() => {
        if (updateMsg !== null) {
            setTimeout(() => {
                setUpdateMsg(null)
            }, 4500);
        }
    }, [updateMsg])

    const showUpdateNotice = async () => {
        try {
            // For Future Me : update this number everytime to notify user that there is a new update in the app.
            const currentVersion = 1;

            const docRef = doc(firestore, 'aboutUpdate', 'updateDoc');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const firestoreVersion = docSnap.data().version;

                if (currentVersion < firestoreVersion) {
                    const updateMessage = docSnap.data().aboutUpdate;
                    setUpdateMsg(updateMessage)
                }
            }
        } catch (error) { }
    }

    const mergeChats = (prevChats, newChats) => {
        const chatMap = {};

        prevChats.forEach(chat => {
            chatMap[chat.chatID] = chat;
        });

        newChats.forEach(chat => {
            chatMap[chat.chatID] = chat;
        });

        return Object.values(chatMap).sort((a, b) => {
            const aTimestamp = a.recentMessage && a.recentMessage.timestamp ? a.recentMessage.timestamp.toMillis() : 0;
            const bTimestamp = b.recentMessage && b.recentMessage.timestamp ? b.recentMessage.timestamp.toMillis() : 0;
            return bTimestamp - aTimestamp; // Sort descending (newest first)
        });
    };

    const addChatToData = (chatID, chatData, recentMessage, username, userpicture) => {
        const chatInfo = {
            chatID,
            ...chatData,
            recentMessage,
            username,
            userpicture
        };
        setNewMessage(true)
        setChats((prevChats) => mergeChats(prevChats, [chatInfo]));
    };

    const handleOpenChat = (chatID, username, searchedUserUID, userpicture) => {
        navigation.navigate('[chatid]', {
            username,
            chatID,
            searchedUserUID,
            currentUserUID,
            userpicture
        });
        setNewMessage(false)
    };

    if (!loaded || currentUserUID === null) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#171722',
                }}
            >
                <ActivityIndicator size="large" color="#FF8C00" />
            </View>
        );
    }

    return (
        <RootSiblingParent>
            <View style={styles.container}>
                {chats.length > 0 ? <FlatList
                    data={chats}
                    keyExtractor={(item) => item.chatID}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => handleOpenChat(item.chatID, item.username, item.recentMessage.from === currentUserUID ? item.recentMessage.to : item.recentMessage.from, item.userpicture)}
                            style={styles.chatItem}
                        >
                            {item.userpicture ?
                                <Image style={{ width: 48, height: 48, borderRadius: 50 }} source={{ uri: item.userpicture }} /> :
                                <Ionicons name='person-circle' size={35} color={'#FF8c00'} />
                            }
                            <View style={{ flex: 1 }}>
                                <View>
                                    <Text style={styles.chatName}>
                                        {item.username}
                                    </Text>
                                    {item.recentMessage && (
                                        <Text numberOfLines={1} style={index === 0 && item.recentMessage.from !== currentUserUID && newMessage ? styles.newRecentMessage : styles.recentMessage}>{item.recentMessage.text}</Text>
                                    )}
                                </View>
                            </View>
                            {(index === 0 && item.recentMessage.from !== currentUserUID && newMessage) && <View style={styles.newRecentMessageIndicator}>
                            </View>}
                        </TouchableOpacity>
                    )}
                />
                    :
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{
                            textAlign: 'center', color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'Outfit-Black-Medium',
                            fontSize: 13

                        }}> When you start conversations with people, they will show up here.. </Text>
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <Text style={{
                                textAlign: 'center', color: '#FF8C00',
                                fontFamily: 'Outfit-Black-Medium',
                                fontSize: 15

                            }}>
                                To get started go to
                            </Text>

                            <Ionicons name='person-add-outline' size={17} color={'#FF8C00'} />
                        </View>
                    </View>
                }
            </View>
            {updateMsg &&
                <View style={styles.customMessage}>
                    <Text style={styles.customMessageText}>
                        {updateMsg}
                    </Text>
                </View>}
        </RootSiblingParent>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#171722',
        paddingHorizontal: 10
    },
    chatItem: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.3)',
        margin: 5,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 7,
        gap: 15
    },
    chatName: {
        color: '#FF8C00',
        fontSize: 20,
        fontWeight: '400',
        fontFamily: 'Outfit-Black-Medium',
    },
    recentMessage: {
        fontSize: 13,
        fontWeight: '900',
        fontFamily: 'Outfit-Black-Medium',
        color: '#888',
    },
    newRecentMessage: {
        fontSize: 13,
        fontWeight: '400',
        fontFamily: 'Outfit-Black-Bold',
        color: 'white',
    },
    newRecentMessageIndicator: {
        height: 10,
        width: 10,
        borderRadius: 50,
        backgroundColor: "#FF8C00"
    },

    customMessage: {
        position: 'absolute',
        zIndex: 1000,
        backgroundColor: "#1f1f2d",
        bottom: 10,
        alignSelf: 'center',
        width: '90%',
        borderRadius: 20,
    },
    customMessageText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '400',
        fontFamily: 'Outfit-Black-Medium',
        color: '#FF8C00',
        padding: 5
    }
});

export default ChatsTab;
