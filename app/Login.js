import {
    View, Text, ScrollView,
    TextInput, StyleSheet, StatusBar,
    TouchableOpacity, KeyboardAvoidingView,
    Platform, Alert, ActivityIndicator
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Login = () => {
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    const [focused, setFocused] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [disabled, setDisabled] = useState(true);
    const emailRef = useRef();
    const passRef = useRef();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setLoading(true);
                setDisabled(true);
                navigation.reset({ index: 0, routes: [{ name: "(tabs)" }] });
            } else {
                setLoading(false);
                setDisabled(true);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setDisabled(!(email.trim() && password.trim()));
    }, [email, password]);

    const handleSignIn = async () => {
        try {
            setLoading(true);
            setDisabled(true);

            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Success", "Logged in successfully!");
            navigation.reset({ index: 0, routes: [{ name: "(tabs)" }] });

        } catch (error) {
            setLoading(false);
            setDisabled(false);

            switch (error.code) {
                case 'auth/invalid-email':
                    Alert.alert('Invalid Email', 'Please enter a valid email address.');
                    break;
                case 'auth/user-not-found':
                    Alert.alert('User Not Found', 'No account found with this email.');
                    break;
                case 'auth/wrong-password':
                    Alert.alert('Incorrect Password', 'Please check your password and try again.');
                    break;
                case 'auth/too-many-requests':
                    Alert.alert('Too Many Attempts', 'Please wait and try again later.');
                    break;
                default:
                    Alert.alert('Error', `Something went wrong: ${error.message}`);
                    console.log(error);
            }
        }
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#171722' }}>
            <StatusBar barStyle="light-content" />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView overScrollMode="never" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ marginTop: '1%', marginHorizontal: 15 }}>
                        <Text style={styles.headerText}>Log In</Text>

                        <Text style={styles.labelStyle}>InTouch Registered Email</Text>
                        <View style={[styles.inputContainer, focused === "email" && styles.focusInput]}>
                            <TextInput
                                cursorColor="#ff9301"
                                ref={emailRef}
                                onSubmitEditing={() => passRef.current.focus()}
                                keyboardType="email-address"
                                returnKeyType="next"
                                onChangeText={setEmail}
                                onFocus={() => setFocused("email")}
                                style={styles.inputStyle}
                                placeholder="john@wick.com"
                                placeholderTextColor="rgba(128, 128, 128, 0.6)"
                            />
                        </View>

                        <Text style={styles.labelStyle}>InTouch Account Password</Text>
                        <View style={[styles.inputContainer, focused === "password" && styles.focusInput]}>
                            <TextInput
                                cursorColor="#ff9301"
                                ref={passRef}
                                keyboardType="default"
                                returnKeyType="done"
                                onChangeText={setPassword}
                                onFocus={() => setFocused("password")}
                                style={styles.inputStyle}
                                secureTextEntry
                                placeholder="●●●●●●●●●"
                                placeholderTextColor="rgba(128, 128, 128, 0.6)"
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            disabled={disabled}
                            style={styles.button}
                            onPress={handleSignIn}>
                            {loading
                                ? <ActivityIndicator size="small" color="#1f1f2d" />
                                : <Text style={styles.buttonText}>Log In</Text>
                            }
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.notAccountText}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('signup')}>
                                <Text style={styles.signupButtonText}> Sign Up!</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
                            <Text style={[styles.notAccountText, { fontSize: 14 }]}>Forgot your password?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
                                <Text style={[styles.signupButtonText, { fontSize: 14, padding: 5 }]}> Reset!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerText: {
        marginVertical: '5%',
        color: 'rgba(255,255,255,0.85)',
        fontSize: 35,
        fontFamily: 'Outfit-Black-Medium',
    },
    inputContainer: {
        height: 50,
        backgroundColor: "#1f1f2d",
        borderRadius: 10,
        marginVertical: 5,
        overflow: 'hidden',
    },
    inputStyle: {
        fontSize: 17,
        padding: 10,
        width: '100%',
        height: '100%',
        color: 'white',
        fontFamily: 'Outfit-Black-Medium',
    },
    focusInput: {
        borderWidth: 1,
        borderColor: '#FF8C00',
    },
    labelStyle: {
        marginVertical: 7,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 17,
        fontFamily: 'Outfit-Black-Regular',
    },
    button: {
        backgroundColor: '#ff9301',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        marginVertical: 23,
        borderRadius: 12,
    },
    buttonText: {
        color: '#171722',
        fontSize: 17,
        fontFamily: 'Outfit-Black-Bold',
    },
    notAccountText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontFamily: 'Outfit-Black-Regular',
    },
    signupButtonText: {
        fontFamily: 'Outfit-Black-Bold',
        fontSize: 16,
        color: '#FF8C00',
    },
});

export default Login;
