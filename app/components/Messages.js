import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, PanResponder, Animated } from 'react-native';

const MessagesItem = ({ item, index, handleLongPress, currentUserUID, setReplyTo }) => {
    const translateX = useRef(new Animated.Value(0)).current;


    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (event, gestureState) => {
            return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
        },
        onPanResponderMove: (event, gestureState) => {
            if (gestureState.dx > 0) {
                translateX.setValue(gestureState.dx);
            }
        },
        onPanResponderRelease: (event, gestureState) => {
            if (gestureState.dx > 10) {
                setReplyTo(item.text);
            }
            Animated.spring(translateX, {
                toValue: 0,
                friction: 7,
                useNativeDriver: true,
            }).start();
        },
        onPanResponderTerminate: () => {
            Animated.spring(translateX, {
                toValue: 0,
                friction: 5,
                useNativeDriver: true,
            }).start();
        },
    });

    const animatedStyle = {
        transform: [{ translateX: translateX }],
    };

    return (
        <Animated.View style={animatedStyle} {...panResponder.panHandlers}>
            <View key={index} style={{ backgroundColor: 'transparent' }}>
                <TouchableOpacity
                    style={item.from === currentUserUID ? styles.sentMessage : styles.receivedMessage}
                    activeOpacity={0.75}
                    onLongPress={(e) => handleLongPress(e, item)}
                >
                    {item.replyTo !== null ? (
                        <View>
                            <Text style={item.from === currentUserUID ? styles.sentReplyText : styles.receivedReplyText}>
                                {item.replyTo}
                            </Text>
                            <Text style={item.from === currentUserUID ? styles.sentText : styles.receivedText}>
                                {item.text || ''}
                            </Text>
                        </View>
                    ) : (
                        <Text style={item.from === currentUserUID ? styles.sentText : styles.receivedText}>
                            {item.text || ''}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};
const styles = StyleSheet.create({
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
        fontSize: 15
    },
    receivedText: {
        color: 'white',
        fontFamily: 'Outfit-Black-Medium',
        fontSize: 15
    },
    sentReplyText: {
        fontFamily: 'Outfit-Black-Regular',
        fontSize: 13,
        fontStyle: 'italic'
    },
    receivedReplyText: {
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Outfit-Black-Regular',
        fontSize: 13,
        fontStyle: 'italic'
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
        width: '100%',
        paddingHorizontal: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
export default MessagesItem