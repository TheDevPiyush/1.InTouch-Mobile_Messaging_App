import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import {
    doc,
    onSnapshot,
    serverTimestamp,
    collection,
    query,
    orderBy,
    addDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    limit,
    deleteField,
    writeBatch,
    where,
    getDocs,
    startAfter,
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons'
import { useFonts } from 'expo-font';
import axios from 'axios';
import OptionsMenu from './components/OptionsMenu';
import * as Clipboard from 'expo-clipboard'
import OptionsMenuOtherUser from './components/OptionsMenuOtherUser';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import MessagesItem from './components/Messages';
import CustomHeader from './components/CustomHeader ';
import * as Notifications from 'expo-notifications'
import { TypingAnimation } from 'react-native-typing-animation';
import RightSideMenu from './components/RightSideMenu';
const Messages = () => {

    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    const { username, chatID, searchedUserUID, currentUserUID, userpicture } = useLocalSearchParams();
    const navigation = useNavigation();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [newMessage, setNewMessage] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [othermenuVisible, setotherMenuVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [reply, setReply] = useState(null)
    const [isTyping, setIsTyping] = useState(false);
    const [pushToken, setPushToken] = useState(null)
    const [lastVisible, setLastVisible] = useState(null);
    const [messageLoading, setMessageLoading] = useState(false)
    const [currentUserName, setCurrentUserName] = useState('')
    const [blockStatus, setBlockStatus] = useState({
        currentUserBlocked: false,
        otherUserBlocked: false,
    });
    const scrollRef = useRef(null);
    const inputRef = useRef(null)
    const typingTimeoutRef = useRef(null);

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const menuWidth = 200;
    const menuHeight = 170;

    useEffect(() => {
        if (!loaded) {
            return null
        }
    }, [loaded])

    useEffect(() => {
        if (username) navigation.setOptions({
            headerTitle: username,
            headerLeft: () => <CustomHeader userpicture={userpicture} />,
            headerRight: () => <RightSideMenu currentUserUID={currentUserUID} searchedUserUID={searchedUserUID} chatID={chatID} username={username} />,
        });
    }, [navigation, username, loaded]);

    useEffect(() => {
        if (chatID) {

            const chatDocRef = doc(firestore, 'Chats', chatID);

            const ListenToMessageUnsubscribe = listenToMessages(chatID, setMessages);

            const unsubscribe = onSnapshot(chatDocRef, (doc) => {
                if (doc.exists()) {
                    setIsTyping(doc.data()[searchedUserUID]);
                }
            });

            const BlockUnsubscribe = onSnapshot(chatDocRef, (chatDocSnap) => {
                if (chatDocSnap.exists()) {
                    const blockData = chatDocSnap.data().Block || {};
                    setBlockStatus({
                        currentUserBlocked: blockData[currentUserUID] || false,
                        otherUserBlocked: blockData[searchedUserUID] || false,
                    });
                }
            });

            getPushToken();
            updateSeenStatus();
            Notifications.setNotificationHandler({});
            return () => {
                unsubscribe();
                BlockUnsubscribe();
                ListenToMessageUnsubscribe()
            }
        }
    }, [loaded, chatID])

    useEffect(() => {
        const chatDocRef = doc(firestore, 'Chats', chatID);

        if (input !== "") {
            updateDoc(chatDocRef, { [currentUserUID]: true });
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                updateDoc(chatDocRef, { [currentUserUID]: false });
            }, 800);
        }
        else { updateDoc(chatDocRef, { [currentUserUID]: false }); }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [input]);

    useEffect(() => { setMessages(newMessage); updateSeenStatus(); }, [newMessage])

    useEffect(() => { autoScroll() }, [])

    const fetchMoreMessages = async () => {
        if (!lastVisible) return;

        if (messages.length > 18) {
            setMessageLoading(true)

            const chatDocRef = doc(firestore, 'Chats', chatID);
            const messagesCollectionRef = collection(chatDocRef, 'Messages');

            const messagesQuery = query(
                messagesCollectionRef,
                orderBy('timestamp', 'desc'),
                startAfter(lastVisible),
                limit(10)
            );

            const querySnapshot = await getDocs(messagesQuery);

            if (!querySnapshot.empty) {
                const newMessages = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

                setNewMessage((prevMessages) => [...prevMessages, ...newMessages]);
                setMessageLoading(false)
            }
            setMessageLoading(false)
        }

    };

    const listenToMessages = (chatID) => {
        const chatDocRef = doc(firestore, 'Chats', chatID);
        const messagesCollectionRef = collection(chatDocRef, 'Messages');

        const messagesQuery = query(
            messagesCollectionRef,
            orderBy('timestamp', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
            const messages = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            if (!querySnapshot.empty) {
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            }
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
                username: username,
                replyTo: reply,
                messageStatus: "sent",
            };

            const chatDocRef = doc(firestore, 'Chats', chatID);
            const messagesCollectionRef = collection(chatDocRef, 'Messages');
            setInput('');
            setReply(null)
            await addDoc(messagesCollectionRef, newMessage);
            sendMessageNotification(input)
            updateSeenStatus();
        }
    };

    const getPushToken = async () => {
        const userDocRef = doc(firestore, 'Users', searchedUserUID);
        const userDoc = await getDoc(userDocRef);
        setPushToken(userDoc.data().pushToken);

        const CurrentUserDocRef = doc(firestore, 'Users', currentUserUID);
        const CurrentUserDoc = await getDoc(CurrentUserDocRef);
        setCurrentUserName(CurrentUserDoc.data().username)
    }

    const sendMessageNotification = async (messageData) => {
        try {
            if (pushToken) {
                const message = {
                    to: pushToken,
                    sound: "default",
                    title: `${currentUserName}`,
                    body: `${messageData}`,
                    data: { chatID },
                    priority: "high",
                    channelId: "messages",
                    vibrate: true,
                };

                try {
                    const response = await axios.post('https://exp.host/--/api/v2/push/send?useFcmV1=true', message, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                } catch (error) { }

            }
        } catch (error) { }
    }

    const handleLongPress = (event, message) => {
        const { pageX, pageY } = event.nativeEvent;
        let x = pageX;
        let y = pageY;

        if (x + menuWidth > screenWidth) {
            x = screenWidth - menuWidth - 10;
        }

        if (x < 10) {
            x = 10;
        }
        if (y + menuHeight > screenHeight) {
            y = screenHeight - menuHeight - 10;
        }

        if (y < 10) {
            y = 10;
        }
        setMenuPosition({ x, y });
        setSelectedMessage(message);
        if (message.from === currentUserUID) setMenuVisible(true);
        else setotherMenuVisible(true)
    };

    const handleOptionSelect = async (option) => {
        setMenuVisible(false);
        setotherMenuVisible(false)
        if (option === 'copy') {
            await Clipboard.setStringAsync(selectedMessage.text)
        }
        else if (option === 'delete') {
            const docRef = doc(firestore, "Chats", chatID, "Messages", selectedMessage.id)
            await deleteDoc(docRef)
        }
        else if (option === 'reply') {
            setReply(selectedMessage.text);
            setTimeout(() => {
                inputRef.current.focus();
            }, 300)
        }
        else if (option === "like") {
            toggleReaction('like')
        }
        else if (option === "heart") {
            toggleReaction('heart')
        }
        else if (option === "smile") {
            toggleReaction('smile')
        }
        else if (option === "laugh") {
            toggleReaction('laugh')
        }
        else if (option === "cry") {
            toggleReaction('cry')

        }
        else if (option === "anger") {
            toggleReaction('anger')

        }
    };

    const toggleReaction = async (option) => {
        const docRef = doc(firestore, "Chats", chatID, "Messages", selectedMessage.id);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const currentReactions = docSnap.data().Reactions || {};

            let newReaction = null;
            switch (option) {
                case "like":
                    newReaction = '👍';
                    break;
                case "heart":
                    newReaction = '❤';
                    break;
                case "smile":
                    newReaction = '😁';
                    break;
                case "laugh":
                    newReaction = '😂';
                    break;
                case "cry":
                    newReaction = '😭';
                    break;
                case "anger":
                    newReaction = '😡';
                    break;
                default:
                    newReaction = null;
            }

            if (currentReactions[currentUserUID] === newReaction) {
                await updateDoc(docRef, {
                    [`Reactions.${currentUserUID}`]: deleteField()
                });
            } else {
                await updateDoc(docRef, {
                    [`Reactions.${currentUserUID}`]: newReaction
                });
                const userDocRef = doc(firestore, 'Users', currentUserUID);
                const userDoc = await getDoc(userDocRef);
                const reactionUsername = userDoc.data().username
                if (reactionUsername) {
                    reactionMessage = `${reactionUsername} has reacted ${newReaction} to a message.`
                    sendMessageNotification(reactionMessage)
                }
            }

        }
    };

    const updateSeenStatus = async () => {
        const chatDocRef = doc(firestore, 'Chats', chatID);
        const messagesCollectionRef = collection(chatDocRef, 'Messages');

        const q = query(messagesCollectionRef, where("to", "==", currentUserUID), where("messageStatus", "==", "sent"));

        const querySnapshot = await getDocs(q);
        const batch = writeBatch(firestore);

        querySnapshot.forEach((doc) => {
            const messageRef = doc.ref;
            batch.update(messageRef, { messageStatus: "seen" });
        });

        await batch.commit();
    };


    const autoScroll = () => {
        if (scrollRef.current && messages.length > 0) {
            scrollRef.current.scrollToIndex({ index: 0, animated: true });
        }
    }

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
        <GestureHandlerRootView>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Offset to handle the keyboard
            >

                {Platform.OS === 'ios'
                    ?
                    <SafeAreaView style={[styles.container, { paddingTop: 0, marginTop: 0 }]}>
                        {messageLoading && <View style={{ backgroundColor: 'transparent' }}>
                            <ActivityIndicator size="small" color="#FF8C00" />
                        </View>}
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            ref={scrollRef}
                            overScrollMode="never"
                            style={styles.flatlist}
                            data={messages}
                            onEndReached={() => fetchMoreMessages()}
                            onEndReachedThreshold={0.2}
                            inverted={true}
                            renderItem={({ item, index }) => (
                                <View style={{ marginBottom: 15 }}>
                                    <MessagesItem
                                        item={item}
                                        index={index}
                                        handleLongPress={handleLongPress}
                                        currentUserUID={currentUserUID}
                                        searchedUserUID={searchedUserUID}
                                        setReplyTo={(item) => { setReply(item) }}
                                        scrollRef={scrollRef}
                                        inputref={inputRef}
                                    />
                                </View>
                            )}
                            keyExtractor={(item, index) => index}
                        />
                        {isTyping &&
                            <View style={{
                                marginBottom: 25,
                                marginHorizontal: 20,
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                            }}>
                                <TypingAnimation
                                    dotColor="rgba(255,255,255,0.5)"
                                    dotRadius={4}
                                    dotX={13}
                                    dotY={6}
                                    dotMargin={7}
                                    dotAmplitude={4}
                                    dotSpeed={0.1}
                                />
                            </View>}
                        {reply &&
                            <View style={{ marginHorizontal: 10, borderTopColor: 'rgba(128,128,128,0.3)', borderTopWidth: 1, marginTop: 5, paddingVertical: 5 }}>

                                <View style={styles.replyContainer}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            color: 'rgba(128,128,128,0.7)',
                                            fontSize: 12,
                                            fontFamily: 'Outfit-Black-Medium',
                                            width: 'auto',
                                        }}>
                                            Reply to
                                        </Text>
                                        <Text numberOfLines={1} style={styles.replyText}>
                                            {reply}
                                        </Text>
                                    </View>

                                    <TouchableOpacity onPress={() => { setReply(null) }}>
                                        <Ionicons name='close-circle-outline' size={20} color={'#ff9301'} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                        }
                        <View style={styles.inputContainer}>
                            {blockStatus.currentUserBlocked && blockStatus.otherUserBlocked ? (
                                <Text style={styles.blockedText}>Conversation is blocked on both sides.</Text>
                            ) : blockStatus.currentUserBlocked ? (
                                <Text style={styles.blockedText}>You have blocked this conversation.</Text>
                            ) : blockStatus.otherUserBlocked ? (
                                <Text style={styles.blockedText}>{username} has blocked this conversation.</Text>
                            ) : (
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        numberOfLines={1}
                                        multiline={true}
                                        cursorColor={'#ff9301'}
                                        ref={inputRef}
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
                            )}

                            <OptionsMenu
                                visible={menuVisible}
                                onClose={() => setMenuVisible(false)}
                                position={menuPosition}
                                onOptionSelect={handleOptionSelect}
                            />

                            <OptionsMenuOtherUser
                                visible={othermenuVisible}
                                onClose={() => setotherMenuVisible(false)}
                                position={menuPosition}
                                onOptionSelect={handleOptionSelect} />
                        </View>
                    </SafeAreaView>
                    :
                    <View style={[styles.container, { paddingTop: 0, marginTop: 0 }]}>
                        {messageLoading && <View style={{ backgroundColor: 'transparent' }}>
                            <ActivityIndicator size="small" color="#FF8C00" />
                        </View>}
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            ref={scrollRef}
                            style={styles.flatlist}
                            data={messages}
                            onEndReached={() => fetchMoreMessages()}
                            onEndReachedThreshold={0.2}
                            inverted={true}
                            renderItem={({ item, index }) => (
                                <View>
                                    <MessagesItem
                                        item={item}
                                        index={index}
                                        handleLongPress={handleLongPress}
                                        currentUserUID={currentUserUID}
                                        searchedUserUID={searchedUserUID}
                                        setReplyTo={(item) => { setReply(item) }}
                                        scrollRef={scrollRef}
                                        inputref={inputRef}
                                    />
                                </View>
                            )}
                            keyExtractor={(item, index) => index}
                        />
                        {isTyping &&
                            <View style={{
                                marginBottom: 25,
                                marginHorizontal: 20,
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                            }}>
                                <TypingAnimation
                                    dotColor="rgba(255,255,255,0.5)"
                                    dotRadius={4}
                                    dotX={13}
                                    dotY={6}
                                    dotMargin={7}
                                    dotAmplitude={4}
                                    dotSpeed={0.1}
                                />
                            </View>}
                        {reply &&
                            <View style={{ marginHorizontal: 10, borderTopColor: 'rgba(128,128,128,0.3)', borderTopWidth: 1, marginTop: 5, paddingVertical: 5 }}>

                                <View style={styles.replyContainer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                color: 'rgba(128,128,128,0.7)',
                                                fontSize: 12,
                                                fontFamily: 'Outfit-Black-Medium',
                                                width: 'auto',
                                            }}>
                                                Reply to
                                            </Text>
                                            <Text numberOfLines={1} style={styles.replyText}>
                                                {reply}
                                            </Text>
                                        </View>

                                        <TouchableOpacity onPress={() => { setReply(null) }}>
                                            <Ionicons name='close-circle-outline' size={20} color={'#ff9301'} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                        }
                        <View style={styles.inputContainer}>
                            {blockStatus.currentUserBlocked && blockStatus.otherUserBlocked ? (
                                <Text style={styles.blockedText}>Conversation is blocked on both sides.</Text>
                            ) : blockStatus.currentUserBlocked ? (
                                <Text style={styles.blockedText}>You have blocked this conversation.</Text>
                            ) : blockStatus.otherUserBlocked ? (
                                <Text style={styles.blockedText}>{username} has blocked this conversation.</Text>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center',flexGrow:1 }}>
                                    <TextInput
                                        numberOfLines={1}
                                        multiline={true}
                                        cursorColor={'#ff9301'}
                                        ref={inputRef}
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
                            )}

                            <OptionsMenu
                                visible={menuVisible}
                                onClose={() => setMenuVisible(false)}
                                position={menuPosition}
                                onOptionSelect={handleOptionSelect}
                            />

                            <OptionsMenuOtherUser
                                visible={othermenuVisible}
                                onClose={() => setotherMenuVisible(false)}
                                position={menuPosition}
                                onOptionSelect={handleOptionSelect} />
                        </View>
                    </View>
                }
            </KeyboardAvoidingView >
        </GestureHandlerRootView>
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
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f1f2d',
        borderRadius: 15,
        padding: 10,
        marginHorizontal: 10,
        marginBottom: 5
    },
    blockedText: {
        fontSize: 14,
        color: '#FF8C00',
        fontFamily: 'Outfit-Black-Regular',
        textAlign: 'center',
        width: '100%',
    },
    input: {
        flex: 1,
        marginRight: 10,
        backgroundColor: 'transparent',
        fontSize: Platform.OS=='web'? 20: 14,
        color: 'white',
        fontFamily: 'Outfit-Black-Regular',
        maxHeight: 60,
    },
    replyText: {
        fontFamily: 'Outfit-Black-Regular',
        fontSize: 13,
        fontStyle: 'italic',
        color: 'rgba(128,128,128,0.6)',
        width: '90%'
    },
    replyContainer: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        justifyContent: 'space-between',
    }
});

export default Messages;
