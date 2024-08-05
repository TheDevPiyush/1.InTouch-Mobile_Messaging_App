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
            <Stack.Screen name='index' options={{ headerShown: false, header: false }} />
            <Stack.Screen name='signup' options={{ headerShown: false, header: false }} />
            <Stack.Screen name='SearchModal' options={{
                presentation: 'modal', title: "Search", headerStyle: { backgroundColor: '#1f1f2d' }, headerTintColor: '#FF8C00',
                headerTitleStyle: { color: '#FF8C00', fontStyle: 'Outfit-Black-Bold', fontSize: 23, marginVertical: 5 },
                headerTitleAlign: 'left'
            }} />
            <Stack.Screen name='(tabs)' options={{ headerShown: false, header: false }} />
        </Stack>
    )
}

export default Layout