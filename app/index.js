import React, { useEffect, useState } from 'react'
import Login from './Login'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
const index = () => {

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('messages', {
            name: 'messages',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,

        });
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Login />

        </GestureHandlerRootView>
    )
}

export default index