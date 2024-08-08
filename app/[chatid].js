import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    Platform,
    KeyboardAvoidingView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import {
    doc,
    onSnapshot,
    updateDoc,
    arrayUnion,
    serverTimestamp,
    collection,
    query,
    orderBy,
    addDoc
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { Keyboard } from 'react-native'; // Import additional necessary components
import Ionicons from '@expo/vector-icons/Ionicons'
import { useFonts } from 'expo-font';
import { v4 as uuidv4 } from 'uuid';

const Messages = () => {

    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    const { username, chatID, searchedUserUID, currentUserUID } =
        useLocalSearchParams();
    const navigation = useNavigation();
    const scrollRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [newMessage, setNewMessage] = useState([]);

    useEffect(() => {
        if (!loaded) {
            return null
        }
    }, [loaded])

    useEffect(() => {
        if (username) navigation.setOptions({ title: username });
    }, [navigation, username, loaded]);

    useEffect(() => {
        listenToMessages(chatID, setMessages);
    }, [chatID, loaded]);

    useEffect(() => {
        if (chatID) {
            const unsubscribe = listenToMessages(chatID, setMessages);
            return () => unsubscribe();
        }
    }, [chatID]);

    useEffect(() => {
        if (scrollRef.current && messages.length > 0) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    useEffect(() => { setMessages(newMessage) }, [newMessage])

    const listenToMessages = (chatID) => {
        const chatDocRef = doc(firestore, 'Chats', chatID);
        const messagesCollectionRef = collection(chatDocRef, 'Messages');

        const messagesQuery = query(
            messagesCollectionRef,
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
            const messages = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setNewMessage(messages)
        });

        return unsubscribe;
    };


    const sendMessage = async () => {
        if (input.trim()) {
            const newMessage = {
                from: currentUserUID,
                to: searchedUserUID,
                text: input,
                timestamp: serverTimestamp(),
                fromUserName: username,
            };

            const chatDocRef = doc(firestore, 'Chats', chatID);
            const messagesCollectionRef = collection(chatDocRef, 'Messages');
            setInput('');
            await addDoc(messagesCollectionRef, newMessage);

        }
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Offset to handle the keyboard
        >

            <SafeAreaView style={[styles.container, { paddingTop: 0, marginTop: 0 }]}>
                <FlatList
                    ref={scrollRef}
                    overScrollMode="never"
                    style={styles.flatlist}
                    data={(messages || []).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))}
                    renderItem={({ item, index }) => (
                        <View
                            key={index}
                            style={
                                item.from === currentUserUID
                                    ? styles.sentMessage
                                    : styles.receivedMessage
                            }
                        >
                            <Text style={item.from === currentUserUID
                                ? styles.sentText
                                : styles.receivedText}>{item.text || ''}</Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => item.timestamp}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd()
                    }
                    onLayout={() => scrollRef.current?.scrollToEnd({ animated: true })}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={input}
                        onChangeText={setInput}
                        placeholderTextColor={'rgba(128,128,128,0.6)'}
                        onSubmitEditing={sendMessage}
                        returnKeyType="send"
                    />
                    <TouchableOpacity onPress={sendMessage}>
                        <Ionicons name='send' size={27} color={'#FF8C00'} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#171722',
    },
    flatlist: {
        flexGrow: 1,
        backgroundColor: '#171722',
        paddingBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f1f2d',
        borderRadius: 15,
        padding: 15,

        marginHorizontal: 10,
    },
    input: {
        flex: 1,
        marginRight: 10,
        backgroundColor: 'transparent',
        fontSize: 18,
        color: 'white',
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#ff9301',
        borderRadius: 20,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 10,
        maxWidth: '70%',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#1f1f2d',
        borderRadius: 20,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 10,
        maxWidth: '70%',
    },
    sentText: {
        fontFamily: 'Outfit-Black-Medium',
        fontSize: 16
    },
    receivedText: {
        color: 'white',
        fontFamily: 'Outfit-Black-Medium',
        fontSize: 16
    }
});

export default Messages;
