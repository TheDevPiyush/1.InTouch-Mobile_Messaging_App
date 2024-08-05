import React, { useState } from 'react'
import { Tabs } from 'expo-router'
import { useFonts } from 'expo-font';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

const Layout = () => {
    const [loaded, error] = useFonts({
        'Outfit-Black-Regular': require('../../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../../assets/Outfit-Bold.ttf'),
    });
    return (
        <Tabs screenOptions={{
            tabBarStyle: { backgroundColor: '#1f1f2d' },
            tabBarActiveTintColor: '#FF8C00',
            tabBarLabelStyle: { fontSize: 15 },
            headerStyle: { backgroundColor: '#1f1f2d',},
            headerTitleStyle: { color: '#FF8C00', fontStyle: 'Outfit-Black-Bold', fontSize: 23, marginVertical: 5 },
            headerTitleAlign: 'left',
        }} >
            <Tabs.Screen options={{
                title: 'Chats',
                tabBarIcon: ({ focused }) => (<AntDesign name="wechat" size={24} color={focused ? '#FF8C00' : 'grey'} />),
                tabBarActiveTintColor: '#FF8C00',

            }} name='ChatsTab' />
            <Tabs.Screen options={{
                title: 'Profile',
                tabBarIcon: ({ focused }) => (<Ionicons name="people" size={24} color={focused ? '#FF8C00' : 'grey'} />),
                tabBarActiveTintColor: '#FF8C00',

            }} name='ProfileTab' />
        </Tabs >
    )
}

export default Layout