import { useEffect } from 'react';
import { SplashScreen, useNavigation } from 'expo-router';
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

const Index = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await AsyncStorage.setItem('LoggedIn', 'true');
                navigation.reset({ index: 0, routes: [{ name: "(tabs)" }] });
            } else {
                await AsyncStorage.setItem('LoggedIn', 'false');
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }
            await SplashScreen.hideAsync();
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#171722' }}></View>
    );
};

export default Index;
