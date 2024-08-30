import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Login from './Login';

const Index = () => {
    useEffect(() => {
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('messages', {
                name: 'messages',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                sound: true,
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                showBadge: true,
                priority: "high",

            });
        }

    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Login />
        </GestureHandlerRootView>
    );
};

export default Index;
