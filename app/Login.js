import {
    View, Text, ScrollView,
    TextInput, StyleSheet, StatusBar,
    TouchableOpacity, KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
SplashScreen.preventAutoHideAsync();

const Login = () => {
    const navigation = useNavigation();
    const [loaded, error] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    const [focused, setFocused] = useState('');
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [disabled, setdisabled] = useState(true)
    const emailRef = useRef();
    const passRef = useRef();
    const [loading, setloading] = useState(false)

    useEffect(() => {
        if (error) {
            console.log('Font loading error:', error);
        }
        if (loaded || error) SplashScreen.hideAsync();
    }, [loaded, error]);

    useEffect(() => {
        if (loaded) {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    console.log('yes user')
                    AsyncStorage.setItem('LoggedIn', 'true')
                    setloading(true)
                    setdisabled(true)
                    navigation.reset({ index: 0, routes: [{ name: "(tabs)" }] });
                }
                else {
                    AsyncStorage.setItem('LoggedIn', 'false')
                    setloading(false)
                    setdisabled(true)

                }
            })
        }
        return () => {
            setloading(false)
            setdisabled(false)
        }
    }, [loaded])


    useEffect(() => {
        if (email.trim() !== '' && password.trim() !== '') setdisabled(false)
        else setdisabled(true)
    }, [email, password])

    const signInWithEmail = async () => {
        try {
            setdisabled(true)
            setloading(true)
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            AsyncStorage.setItem('LoggedIn', 'true')
            setdisabled(false)
            setloading(false)
            navigation.reset({ index: 0, routes: [{ name: "(tabs)" }] });
        } catch (error) {
            setdisabled(false)
            setloading(false)
            if (error.code === 'auth/invalid-credential') Alert.alert('Wrong Credentials', "Wrong email or password. Try again.")
            else if (error.code === 'auth/too-many-requests') Alert.alert('Too many attempts', "You've tried too many failed attempts. Try again after few minutes.")
            else if (error.code === 'auth/invalid-email') Alert.alert('Account not found', "There is no account registered with this email. Sign up to continue.")
            else {
                Alert.alert(`Something went wrong`, `We will try to fix this as soon as possible. Error Code - "${error.code}"`);
                console.log(error)
            }
        }
    }

    if (!loaded && !error) return null;

    return (
        <SafeAreaView style={{
            flex: 1, backgroundColor: '#171722'
        }}>
            <StatusBar barStyle='light-content' />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <ScrollView overScrollMode='never' keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Main View */}
                    <View style={{
                        marginTop: '1%', marginHorizontal: 15
                    }}>
                        <Text style={{
                            marginVertical: '5%',
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: 35,
                            fontFamily: 'Outfit-Black-Medium',
                        }}>Log In</Text>
                        <Text style={styles.labelStyle}>Email</Text>
                        <View
                            style={[
                                styles.inputContainer, focused === "email"
                                && styles.focusInput]}>
                            <TextInput
                                cursorColor={'#ff9301'}

                                ref={emailRef}
                                onSubmitEditing={() => { passRef.current.focus() }}
                                keyboardType='email-address'
                                returnKeyType='next'
                                onChangeText={setemail}
                                onFocus={() => { setFocused("email") }}
                                style={styles.inputStyle}
                                placeholder='john@wick.com'
                                placeholderTextColor='rgba(128, 128,128,0.6)'
                            />
                        </View>
                        <Text style={styles.labelStyle}>Password</Text>
                        <View style={[styles.inputContainer, focused === "password" && styles.focusInput]}>
                            <TextInput
                                cursorColor={'#ff9301'}

                                ref={passRef}
                                keyboardType='default'
                                returnKeyType=''
                                onChangeText={setpassword}
                                onFocus={() => { setFocused("password") }}
                                style={styles.inputStyle}
                                secureTextEntry={true}
                                placeholder='●●●●●●●●●'
                                placeholderTextColor='rgba(128, 128,128,0.6)'
                            />
                        </View>
                        {/* MAIN LOG IN BUTTON */}
                        <TouchableOpacity activeOpacity={0.7} disabled={disabled} style={styles.button} onPress={signInWithEmail}>
                            {loading
                                ? <ActivityIndicator size={'small'} color={'#1f1f2d'} />
                                : <Text style={styles.buttonText}>Log In</Text>
                            }
                        </TouchableOpacity>
                        {/* GO TO SIGN UP PAGE BUTTON */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Text style={styles.notAccountText}>
                                Don't have an account?
                            </Text>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate('signup')
                            }}>
                                <Text style={styles.signupbuttonText}> Sign Up!</Text>
                            </TouchableOpacity>
                        </View>
                        {/* {GO TO FORGOT Password} */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5
                        }}>
                            <Text style={[styles.notAccountText, { fontSize: 14 }]}>
                                Forgot your password?
                            </Text>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate('PasswordReset')
                            }}>
                                <Text style={[styles.signupbuttonText, { fontSize: 14, padding: 5 }]}> Reset!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    )

}
const styles = StyleSheet.create({
    inputContainer: {
        height: 50,
        backgroundColor: "#1f1f2d",
        borderRadius: 10,
        marginVertical: 5,
        overflow: 'hidden'
    },
    inputStyle: {
        fontSize: 17,
        padding: 10, width: '100%', height: '100%', color: 'white',
        fontFamily: 'Outfit-Black-Medium'
    },
    focusInput: {
        borderWidth: 1,
        borderColor: '#FF8C00'
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
        width: '100%',
        marginHorizontal: 'auto',
        marginVertical: 23,
        borderRadius: 12
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
    signupbuttonText: {
        fontFamily: 'Outfit-Black-Bold',
        fontSize: 16,
        color: '#FF8C00'
    },
})

export default Login