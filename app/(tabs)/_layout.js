import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
    return (
        <Tabs>
            <Tabs.Screen name='profileTab' />
            <Tabs.Screen name='settingsTab' />
        </Tabs>
    )
}

export default _layout