import { useEffect } from 'react';
import { SplashScreen, useNavigation } from 'expo-router';
import { auth } from '../firebaseConfig';
import { View } from 'react-native';

const Index = () => {
    const navigation = useNavigation();

    useEffect(() => {
        console.log(1);
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log(2);
                navigation.reset({ index: 0, routes: [{ name: "(tabs)" }] });
            } else {
                console.log(3);
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
