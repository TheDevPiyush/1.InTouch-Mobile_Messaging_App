import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from 'expo-router';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const PasswordReset = () => {
    const emailRef = useRef(null);
    const [email, setemail] = useState('');
    const [focused, setFocused] = useState('');
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [message, setMessage] = useState('');
    const [messageError, setMessageError] = useState('');
    const [countDown, setCountDown] = useState(0);
    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    const auth = getAuth();
    const navigation = useNavigation();

    const handlePasswordReset = async () => {
        try {
            setLoading(true);
            const usersCollection = collection(firestore, 'Users');
            const q = query(usersCollection, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                await sendPasswordResetEmail(auth, email);
                setMessage('Password reset link sent! Please check your inbox.');
                setMessageError('');
                setDisabled(true);
                setCountDown(30);
            } else {
                setMessage('');
                setMessageError('Account doesn\'t exist for this email.');
            }
        } catch (error) {
            console.log('Error:', error);
            setMessage('');
            setMessageError('Failed to send password reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setDisabled(countDown > 0 || email.trim() === '');

        if (countDown > 0) {
            const interval = setInterval(() => {
                setCountDown((prevCount) => prevCount - 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [countDown, email]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={styles.main}>
                <ScrollView overScrollMode='never' keyboardShouldPersistTaps="handled" style={{ flex: 1, paddingTop: '15%', backgroundColor: 'transparent' }}>
                    <Text style={{
                        color: 'white',
                        fontSize: 30,
                        fontFamily: 'Outfit-Black-Bold',
                    }}>Reset Password</Text>
                    <Text style={styles.labelStyle}>You will receive a secure link via email to reset your password.</Text>
                    <Text style={styles.labelStyle}>Email</Text>
                    <View
                        style={[
                            styles.inputContainer, focused === "email"
                            && styles.focusInput]}>
                        <TextInput
                            cursorColor={'#ff9301'}
                            ref={emailRef}
                            keyboardType='email-address'
                            returnKeyType='send'
                            onFocus={() => { setFocused("email") }}
                            onChangeText={setemail}
                            style={styles.inputStyle}
                            placeholder='john@wick.com'
                            placeholderTextColor='rgba(128, 128,128,0.6)'
                        />
                    </View>
                    {message && <Text style={[styles.labelStyle, { fontSize: 14, color: '#FF8C00' }]}>{message}</Text>}
                    {countDown > 0 && <Text style={[styles.labelStyle, { fontSize: 14, color: 'rgba(128,128,128,0.8)' }]}>
                        You can request a new link in <Text style={{ color: '#FF8C00' }}> {countDown} </Text> seconds.
                    </Text>}
                    {messageError && <Text style={[styles.labelStyle, { fontSize: 14, color: 'rgba(128,128,128,0.6)' }]}>{messageError}</Text>}

                    <TouchableOpacity activeOpacity={0.7} disabled={disabled} style={styles.button} onPress={handlePasswordReset}>
                        {loading
                            ? <ActivityIndicator size={'small'} color={'#1f1f2d'} />
                            : <Text style={styles.buttonText}>Send Password Reset Link</Text>
                        }
                    </TouchableOpacity>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={styles.notAccountText}>
                            Remember your password?
                        </Text>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('index')
                        }}>
                            <Text style={styles.signupbuttonText}> Login!</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#171722',
        paddingHorizontal: 10,
    },
    labelStyle: {
        marginVertical: 8,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 17,
        fontFamily: 'Outfit-Black-Regular',
    },
    inputContainer: {
        height: 55,
        backgroundColor: "#1f1f2d",
        borderRadius: 10,
        marginVertical: 5
    },
    inputStyle: {
        fontSize: 17,
        padding: 12, width: '100%', height: '100%', color: 'white',
        fontFamily: 'Outfit-Black-Medium'
    },
    focusInput: {
        borderWidth: 1,
        borderColor: '#FF8C00'
    },
    button: {
        backgroundColor: '#ff9301',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        width: '100%',
        marginVertical: 15,
        borderRadius: 15
    },
    buttonText: {
        color: '#171722',
        fontSize: 17,
        fontFamily: 'Outfit-Black-Bold',
    },
    notAccountText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontFamily: 'Outfit-Black-Regular',
    },
    signupbuttonText: {
        fontFamily: 'Outfit-Black-Bold',
        fontSize: 16,
        color: '#FF8C00'
    },
});

export default PasswordReset;
