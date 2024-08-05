import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig'; // Adjust the import based on your setup
import { useNavigation } from 'expo-router';

const ChatsTab = ({userId }) => {

    const [chats, setChats] = useState([]);
    const navigation = useNavigation()
    useEffect(() => {
        const fetchChats = async () => {
            const q = query(collection(firestore, 'Chats'), where('participants', 'array-contains', 'user1'));
            const querySnapshot = await getDocs(q);
            const chatData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChats(chatData);
        };

        fetchChats();
    }, [userId]);

    const openChat = (chatId) => {
        navigation.navigate('ChatScreen', 'user1');
    };

    return (
        <View>
            <FlatList
                data={chats}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => openChat(item.id)}>
                        <Text>{item.participants.filter(participant => participant !== userId).join(', ')}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default ChatsTab;
