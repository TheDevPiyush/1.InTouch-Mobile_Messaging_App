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
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

SplashScreen.preventAutoHideAsync();
const Signup = () => {
    const navigation = useNavigation();
    const [loaded, error] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    const [focused, setFocused] = useState('');
    const [username, setusername] = useState('');
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [disabled, setdisabled] = useState(true)
    const usernameRef = useRef();
    const emailRef = useRef();
    const passRef = useRef();
    const [loading, setloading] = useState(false)


    useEffect(() => {
        if (loaded || error) SplashScreen.hideAsync();
    }, [loaded, error]);

    useEffect(() => {
        if (email.trim() !== '' && password.trim() !== '' && username.trim() !== '') setdisabled(false)
        else setdisabled(true)
    }, [username, email, password])

    if (!loaded && !error) return null;

    const auth = getAuth()


    const checkUsernameExists = async (username) => {
        const usersRef = collection(firestore, 'Users');
        const q = query(usersRef, where('username', '==', username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const handleSignUp = async () => {
        setdisabled(true);
        setloading(true);

        const usernameExists = await checkUsernameExists(username);
        if (usernameExists) {
            setdisabled(false);
            setloading(false);
            Alert.alert('Username Taken', `The username "${username}" is already taken. Please choose a different username.`);
            return;
        }

        await createNewUserAndProfile();
    };

    const createNewUserAndProfile = async () => {
        try {
            setdisabled(true)
            setloading(true)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(firestore, 'Users', user.uid), {
                username: username.toLowerCase(),
                email: email,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                uid: userCredential.user.uid
            });
            setdisabled(false)
            setloading(false)
            Alert.alert('Success', 'Your account has been created successfully.');
            navigation.navigate('index');
        } catch (error) {
            setdisabled(false)
            setloading(false)
            console.log(error.code)
            if (error.code === 'auth/email-already-in-use') Alert.alert('Account Already Exits', `The email "${email}" is already in use.`)
            else if (error.code === 'auth/invalid-email') Alert.alert('Invalid Email', `Valid email format is required.`)
            else if (error.code === 'auth/weak-password') Alert.alert('Weak Password', `Choose a strong password by combining letters, numbers or characters.`)

            else Alert.alert('Something went wrong', 'Please try again. Something went wrong, we are working on it.')
        }
    }

    return (
        <SafeAreaView style={{
            flex: 1, backgroundColor: '#171722'
        }}>

            <StatusBar barStyle='light-content' />

            <KeyboardAvoidingView style={{ backgroundColor: "rgba(0,255,0,0)" }} behavior={Platform.OS === 'ios' ? 'height' : 'height'} >
                <ScrollView keyboardShouldPersistTaps="handled" overScrollMode='never'>
                    {/* Main View */}
                    <View style={{
                        marginTop: '1%', marginHorizontal: 15
                    }}>
                        <Text style={{
                            marginVertical: '5%',
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: 35,
                            fontFamily: 'Outfit-Black-Medium',
                        }}>Sign Up</Text>
                        <Text style={styles.labelStyle}>Choose a unique Username</Text>
                        <View style={[styles.inputContainer, focused === "username" && styles.focusInput]}>
                            <TextInput
                                cursorColor={'#ff9301'}
                                ref={usernameRef}
                                keyboardType='default'
                                autoCorrec={false}
                                returnKeyType='next'
                                onChangeText={text =>
                                    setusername(text.toLowerCase().replace(/\s+/g, ''))
                                }
                                value={username}
                                onFocus={() => { setFocused("username") }}
                                onSubmitEditing={() => { emailRef.current.focus() }}
                                style={styles.inputStyle}
                                placeholder='username@69'
                                placeholderTextColor='rgba(128, 128,128,0.6)'
                            />
                        </View>
                        <Text style={styles.labelStyle}>Enter an Email <Text style={{ opacity: "0.7", fontSize: 12 }}>(only you can see this email)</Text></Text>
                        <View style={[styles.inputContainer, focused === "email" && styles.focusInput]}>
                            <TextInput
                                cursorColor={'#ff9301'}
                                ref={emailRef}
                                onSubmitEditing={() => { passRef.current.focus() }}
                                keyboardType='email-address'
                                returnKeyType='next'
                                onChangeText={setemail}
                                onFocus={() => { setFocused("email") }}
                                style={styles.inputStyle}
                                placeholder='youremail@example.com'
                                placeholderTextColor='rgba(128, 128,128,0.6)'
                            />
                        </View>
                        <Text style={styles.labelStyle}>Choose a Strong Password
                            <Text style={{ opacity: "0.7", fontSize: 12 }}> (Use Strong Combinations)</Text></Text>
                        <View style={[styles.inputContainer, focused === "password" && styles.focusInput]}>
                            <TextInput
                                cursorColor={'#ff9301'}
                                ref={passRef}
                                keyboardType='default'
                                returnKeyType='next'
                                onChangeText={setpassword}
                                onFocus={() => { setFocused("password") }}
                                style={styles.inputStyle}
                                secureTextEntry={true}
                                placeholder='●●●●●●●●●'
                                placeholderTextColor='rgba(128, 128,128,0.6)'
                            />
                        </View>
                        {/* SIGN UP BUTTON */}
                        <TouchableOpacity activeOpacity={0.7} disabled={disabled} style={styles.button} onPress={handleSignUp}>
                            {loading
                                ? <ActivityIndicator size={'small'} color={'#1f1f2d'} />
                                : <Text style={styles.buttonText}>Sign Up</Text>
                            }
                        </TouchableOpacity>
                        {/* GO TO LOG IN PAGE BUTTON */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'center', marginVertical: 10
                        }}>
                            <Text style={styles.haveAccountText}>
                                Already have an account?
                            </Text>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate('index')
                            }}>
                                <Text style={styles.loginbuttonText}> Log in!</Text>
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
        height: 55,
        backgroundColor: "#1f1f2d",
        borderRadius: 10,
        marginVertical: 5
    },
    labelStyle: {
        marginVertical: 7,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 17,
        fontFamily: 'Outfit-Black-Regular',
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
        marginHorizontal: 'auto',
        marginVertical: 17,
        borderRadius: 12
    },
    buttonText: {
        color: '#171722',
        fontSize: 17,
        fontFamily: 'Outfit-Black-Bold',
    },
    haveAccountText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontFamily: 'Outfit-Black-Regular',
    },
    loginbuttonText: {
        fontFamily: 'Outfit-Black-Bold',
        fontSize: 15,
        color: '#FF8C00'
    },
})

export default Signup