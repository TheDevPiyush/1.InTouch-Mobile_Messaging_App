import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
    return (
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false, header: false }} />
            <Stack.Screen name='signup' options={{ headerShown: false, header: false }} />
            <Stack.Screen name='(tabs)' options={{ headerShown: false, header: false }} />
        </Stack>
    )
}

export default _layout