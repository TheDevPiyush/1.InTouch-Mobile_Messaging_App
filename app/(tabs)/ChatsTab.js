import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { firestore, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { router, useNavigation } from 'expo-router';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons'

const ChatsTab = () => {
    const currentUserUID = auth.currentUser.uid;
    const [chats, setChats] = useState([]);
    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });

    const navigation = useNavigation();

    useEffect(() => {
        if (!loaded) return null;

        const chatsCollectionRef = collection(firestore, 'Chats');

        const chatsQuery = query(
            chatsCollectionRef,
            where('participants', 'array-contains', currentUserUID)
        );

        const userCache = {};

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

                        if (userCache[otherUserUid]) {
                            addChatToData(chatID, chatData, recentMessage, userCache[otherUserUid]);
                        } else {
                            const userDocRef = doc(firestore, 'Users', otherUserUid);
                            getDoc(userDocRef).then((userDoc) => {
                                if (userDoc.exists()) {
                                    const username = userDoc.data().username;
                                    userCache[otherUserUid] = username; // Cache the username

                                    addChatToData(chatID, chatData, recentMessage, username);
                                } else {
                                    console.error('No such user!');
                                    addChatToData(chatID, chatData, recentMessage, 'Unknown User');
                                }
                            }).catch((error) => {
                                console.error('Error getting user document:', error);
                                addChatToData(chatID, chatData, recentMessage, 'Error User');
                            });
                        }
                    }
                });

                chatsData.push({ chatID, ...chatData });
            }
        });

        return () => {
            unsubscribe();
        };

    }, [currentUserUID, loaded]);

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

    const addChatToData = (chatID, chatData, recentMessage, username) => {
        const chatInfo = {
            chatID,
            ...chatData,
            recentMessage,
            username,
        };

        setChats((prevChats) => mergeChats(prevChats, [chatInfo]));
    };

    const handleOpenChat = (chatID, username, searchedUserUID) => {
        navigation.navigate('[chatid]', {
            username,
            chatID,
            searchedUserUID,
            currentUserUID,
        });
    };

    if (!loaded) {
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
        <View style={styles.container}>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.chatID}
                renderItem={({ item }) => (
                    <TouchableOpacity
                    onLongPress={()=>{console.log('hold')}}
                        onPress={() => handleOpenChat(item.chatID, item.username, item.recentMessage.from === currentUserUID ? item.recentMessage.to : item.recentMessage.from)}
                        style={styles.chatItem}
                    >
                        <Ionicons name='person-circle' size={40} color={'#FF8c00'} />
                        <View>
                            <Text style={styles.chatName}>
                                {item.username}
                            </Text>
                            {item.recentMessage && (
                                <Text style={styles.recentMessage}>{item.recentMessage.text}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
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
        fontSize: 23,
        fontWeight: '400',
        fontFamily: 'Outfit-Black-Medium',
    },
    recentMessage: {
        fontSize: 15,
        fontWeight: '400',
        fontFamily: 'Outfit-Black-Medium',
        color: '#888',
    },
});

export default ChatsTab;
