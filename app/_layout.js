import React from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font';

const Layout = () => {
    const [loaded, error] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });
    return (
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen name='signup' options={{ headerShown: false }} />
            <Stack.Screen name='Login' options={{ headerShown: false }} />
            <Stack.Screen name='PasswordReset' options={{ headerShown: false }} />
            <Stack.Screen name='SearchModal' options={{
                presentation: 'modal', title: "Search", headerStyle: { backgroundColor: '#1f1f2d' }, headerTintColor: '#FF8C00',
                headerTitleStyle: { color: 'white', fontStyle: 'Outfit-Black-Bold', fontSize: 23, marginVertical: 5 },
                headerTitleAlign: 'left'
            }} />
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen name='[chatid]' options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1f1f2d' },
                headerBackTitleVisible: false,
                headerTitleStyle: {
                    color: 'white',
                    fontStyle: 'Outfit-Black-Medium',
                    fontSize: 17,
                },
                headerTintColor: '#FF8C00',
                headerBackButtonMenuEnabled: true,
                headerBackVisible: true,
                headerTitleAlign: 'center',
                headerBackTitle: "inbox"
            }} />
            <Stack.Screen name='ProfilePicModal' options={{
                headerShown: false,
                presentation: 'modal',
            }} />
        </Stack>
    )
}

export default Layout