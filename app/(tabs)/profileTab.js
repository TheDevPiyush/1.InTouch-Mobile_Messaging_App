import {
    View,
    Text,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileTab = () => {
    const [fontsLoaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });

    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [uid, setUid] = useState('');

    useEffect(() => {
        if (fontsLoaded) {
            getCurrentUserInfo();
        }
    }, [fontsLoaded]);

    const getCurrentUserInfo = async () => {
        const userDocRef = doc(firestore, 'Users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        const data = docSnap.data();
        setUser(data.username);
        setEmail(data.email);
        setUid(data.uid);
    };

    const handleLogout = () => {
        AsyncStorage.setItem("LoggedIn", 'false')
        auth.signOut();
        router.replace('/');
    };

    // Render loading spinner if fonts aren't loaded
    if (!fontsLoaded) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#171722', // Added background color to match the app
                }}
            >
                <ActivityIndicator size="large" color="#FF8C00" />
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#171722',
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    marginHorizontal: 15,
                }}
            >
                <Text style={styles.headingText}>InTouch Username</Text>
                <View style={styles.containerView}>
                    <Ionicons name="person" size={25} color="#FF8C00" />
                    <Text style={styles.text}>{user}</Text>
                </View>

                <Text style={styles.headingText}>InTouch registered email</Text>
                <View style={styles.containerView}>
                    <Ionicons name="mail" size={25} color="#FF8C00" />
                    <Text style={styles.text}>{email}</Text>
                </View>

                <Text style={styles.headingText}>InTouch unique User ID</Text>
                <View style={styles.containerView}>
                    <Ionicons name="key" size={25} color="#FF8C00" />
                    <Text style={styles.text}>{uid}</Text>
                </View>

                <View>
                    <TouchableOpacity onPress={handleLogout} style={styles.button}>
                        <Text style={styles.btnText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    containerView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        backgroundColor: '#1f1f2d',
        padding: 15,
        borderRadius: 16,
    },
    button: {
        backgroundColor: '#ff9301',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 17,
        width: '100%',
        marginHorizontal: 'auto',
        marginVertical: 30,
        borderRadius: 12,
    },
    text: {
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Outfit-Black-Bold', // Corrected font name
        color: '#FF8C00',
    },
    btnText: {
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Outfit-Black-Bold', // Corrected font name
    },
    headingText: {
        marginTop: 15,
        marginBottom: 5,
        fontSize: 14,
        fontFamily: 'Outfit-Black-Bold', // Corrected font name
        color: 'rgba(128,128,128,0.4)',
    },
});

export default ProfileTab;
