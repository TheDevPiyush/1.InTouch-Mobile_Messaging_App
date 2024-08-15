import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase/app';
import 'firebase/storage';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


const ProfileTab = () => {
    const [fontsLoaded] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });

    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [uid, setUid] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fontsLoaded) {
            getCurrentUserInfo().catch(console.error);
        }
    }, [fontsLoaded]);

    const getCurrentUserInfo = async () => {
        try {
            const userDocRef = doc(firestore, 'Users', auth.currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            const data = docSnap.data();
            setUser(data.username);
            setEmail(data.email);
            setUid(data.uid);
            setProfilePicUrl(data.profilePicUrl || null); // Handle undefined or null
        } catch (error) {
        }
    };

    const handleLogout = () => {
        AsyncStorage.setItem("LoggedIn", 'false').catch(console.error);
        auth.signOut().catch(console.error);
        router.replace('/');
    };

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                setLoading(true);
                const imageUrl = await uploadImageToFirebase(result.assets[0].uri);
                await saveProfilePictureUrl(imageUrl);
                setProfilePicUrl(imageUrl);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const uploadImageToFirebase = async (uri) => {
        try {
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    console.log(e);
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });

            const storage = getStorage(); // Correctly initialize the Firebase Storage instance
            const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
            const snapshot = await uploadBytes(storageRef, blob);

            blob.close();

            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            Alert.alert('Upload Failed', 'There was some issue in updating your pic.')
            throw error;
        }
    };

    const saveProfilePictureUrl = async (imageUrl) => {
        try {
            const userDocRef = doc(firestore, 'Users', auth.currentUser.uid);
            await updateDoc(userDocRef, {
                profilePicUrl: imageUrl,
            });
        } catch (error) {
            throw error;
        }
    };

    if (!fontsLoaded) {
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
                <View style={styles.profilePicContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#FF8C00" />
                        ) : profilePicUrl ? (
                            <>
                                <Image
                                    source={{ uri: profilePicUrl }}
                                    style={styles.profilePic}
                                />
                                <Ionicons name='add-circle' size={30} color={'#FF8C00'} style={styles.addPic} />
                            </>
                        ) : (
                            <Ionicons name="person-add" size={100} color="#FF8C00" />
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={[styles.text, styles.nameText]}>{user}</Text>

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
    addPic: {
        position: 'absolute',
        right: 0,
        bottom: 0
    },
    profilePicContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
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
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Outfit-Black-Bold',
        color: '#FF8C00',
    },
    btnText: {
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Outfit-Black-Bold',
    },
    headingText: {
        marginTop: 15,
        marginBottom: 5,
        fontSize: 14,
        fontFamily: 'Outfit-Black-Bold',
        color: 'rgba(128,128,128,0.4)',
    },
    nameText: {
        textAlign: 'center',
        fontSize: 30,
        marginVertical: 10
    }
});

export default ProfileTab;
