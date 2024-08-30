import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, Animated } from 'react-native';

const MessagesItem = ({ item, index, handleLongPress, currentUserUID, searchedUserUID, setReplyTo, inputref }) => {
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
                setTimeout(() => {
                    inputref.current.focus();
                }, 300)
            }
            Animated.spring(translateX, {
                toValue: 0,
                friction: 3,
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
                    style={item.from === currentUserUID ? [styles.sentMessage, { borderBottomRightRadius: index === 0 ? 0 : 20 }] : [styles.receivedMessage, { borderTopLeftRadius: index === 0 ? 0 : 20 }]}
                    activeOpacity={0.75}
                    onLongPress={(e) => handleLongPress(e, item)}>

                    <View style={{ flexDirection: 'column', }}>
                        <View style={{ justifyContent: 'flex-start', padding: 5 }}>
                            {item.replyTo !== null &&
                                <Text style={item.from === currentUserUID ? styles.sentReplyText : styles.receivedReplyText}>
                                    {item.replyTo}
                                </Text>
                            }
                            <Text style={item.from === currentUserUID ? styles.sentText : styles.receivedText}>
                                {item.text}
                            </Text>
                        </View>
                        {item.timestamp &&
                            <View style={{
                                alignSelf: 'flex-end',
                                paddingHorizontal: 3,

                            }}>
                                <Text style={{
                                    color: "#383849",
                                    fontSize: 10,
                                    textAlign: item.from === currentUserUID ? 'right' : 'left',

                                }}>
                                    {item.timestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(':', ':')}
                                </Text>
                            </View>
                        }

                        {item.Reactions?.[searchedUserUID] &&
                            <View style={{
                                position: 'absolute',
                                bottom: -15,
                                zIndex: 100,
                                right: item.from === currentUserUID ? 0 : null,
                                left: item.from === currentUserUID ? null : 22,
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                padding: 3,
                                borderRadius: 50,
                                justifyContent: 'center',
                                alignItems: 'center',

                            }}>
                                <Text style={{ fontSize: 13 }}>
                                    {item.Reactions?.[searchedUserUID]}
                                </Text>
                            </View>
                        }

                        {item.Reactions?.[currentUserUID] &&
                            <View style={{
                                position: 'absolute',
                                bottom: -15,
                                zIndex: 100,
                                right: item.from === currentUserUID ? 22 : null,
                                left: item.from === currentUserUID ? null : 0,
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                padding: 3,
                                borderRadius: 50,
                                justifyContent: 'center',
                                alignItems: 'center',

                            }}>
                                <Text style={{ fontSize: 13 }}>
                                    {item.Reactions?.[currentUserUID]}
                                </Text>
                            </View>
                        }



                    </View>

                </TouchableOpacity>
            </View >
        </Animated.View >
    );
};
const styles = StyleSheet.create({
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#ff9301',
        borderRadius: 20,
        marginVertical: 3,
        marginHorizontal: 10,
        maxWidth: '70%',
        padding: 5,
        marginVertical: 5

    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#1f1f2d',
        borderRadius: 20,
        marginVertical: 5,
        marginHorizontal: 10,
        maxWidth: '70%',
        padding: 5,
        marginVertical: 5


    },
    sentText: {
        fontFamily: 'Outfit-Black-Medium',
        fontSize: 15,
    },
    receivedText: {
        color: 'white',
        fontFamily: 'Outfit-Black-Medium',
        fontSize: 15,
        overflow: 'visible'
    },
    sentReplyText: {
        fontFamily: 'Outfit-Black-Regular',
        fontSize: 14,
        fontStyle: 'italic',
    },
    receivedReplyText: {
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Outfit-Black-Regular',
        fontSize: 14,
        fontStyle: 'italic',
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