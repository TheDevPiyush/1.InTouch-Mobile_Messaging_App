import { View, Text, ScrollView, TextInput, StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from 'expo-router';
import logo from '../assets/image.png'

SplashScreen.preventAutoHideAsync();
const login = () => {
    const [loaded, error] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    const navigation = useNavigation();

    const [focused, setFocused] = useState('');

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }
    return (
        <SafeAreaView style={{
            flex: 1, backgroundColor: '#171722'
        }}>
            <StatusBar barStyle='light-content' />

            <ScrollView contentContainerStyle={{
                backgroundColor: "rgba(255, 0,0,0)", flexGrow: 1
            }}>
                {/* Main View */}
                <View style={{
                    marginTop: '8%', marginHorizontal: 15
                }}>
                    {/* Title Text*/}
                    <View style={{
                        backgroundColor: '', flexDirection: 'row',
                        alignItems: 'center', gap: 10,
                    }}>
                        <Image source={logo} style={{ height: 50, width: 50, alignItems: 'center', }} resizeMode='contain' />
                        <Text style={{
                            color: 'white',
                            fontSize: 50,
                            fontFamily: 'Outfit-Black-Bold',
                        }}>InTouch</Text>
                    </View>

                    <Text style={{
                        marginVertical: '7%',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 35,
                        fontFamily: 'Outfit-Black-Medium',
                    }}>Log In</Text>

                    <Text style={styles.labelStyle}>Email</Text>
                    <View style={[styles.inputContainer, focused === "email" && styles.focusInput]}>
                        <TextInput
                            onFocus={() => { setFocused("email") }}
                            style={styles.inputStyle}
                            placeholder='john@wick.com'
                            placeholderTextColor='rgba(128, 128,128,0.6)'
                        />
                    </View>

                    <Text style={styles.labelStyle}>Password</Text>
                    <View style={[styles.inputContainer, focused === "password" && styles.focusInput]}>
                        <TextInput
                            onFocus={() => { setFocused("password") }}
                            style={styles.inputStyle}
                            secureTextEntry={true}
                            placeholder='●●●●●●●●●'
                            placeholderTextColor='rgba(128, 128,128,0.6)'
                        />
                    </View>
                    {/* MAIN LOG IN BUTTON */}
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Log In</Text>
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

                </View>
            </ScrollView>
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
        marginVertical: 10,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 20,
        fontFamily: 'Outfit-Black-Regular',
    },
    inputStyle: {
        fontSize: 20,
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
        paddingVertical: 17,
        width: '100%',
        marginHorizontal: 'auto',
        marginVertical: 30,
        borderRadius: 12
    },
    buttonText: {
        color: '#171722',
        fontSize: 20,
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
})

export default login