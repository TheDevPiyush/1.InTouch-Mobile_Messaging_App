import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
const CustomHeader = ({ userpicture }) => {

    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });

    const [pic, setPic] = useState(null)


    useEffect(() => {
        if (userpicture !== "undefined" && userpicture !== undefined) {
            setPic(userpicture.replace('profile_pictures/', 'profile_pictures%2F'))
        }
    }, [userpicture])

    const openProfilePicModal = () => {
        if (pic && pic !== "undefined") {
            router.push({ pathname: '/ProfilePicModal', params: { picUrl: pic } })
        }
    }

    return (
        <GestureHandlerRootView style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerContainer}>
                {pic ?
                    <TouchableOpacity activeOpacity={0.6} onPress={openProfilePicModal}>
                        <Image
                            source={{ uri: pic }}
                            style={styles.profilePic}
                            resizeMode='cover'
                        />
                    </TouchableOpacity>
                    :
                    <Ionicons name="person" size={35} color="#FF8c00" />
                }
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        height: 47,
        width: 47
    },
    profilePic: {
        height: 47,
        width: 47,
        borderRadius: 50,
    },
    usernameStyle: {
        fontSize: 17,
        fontFamily: 'Outfit-Black-Medium',
        color: '#FF8C00'
    }
});

export default CustomHeader;
