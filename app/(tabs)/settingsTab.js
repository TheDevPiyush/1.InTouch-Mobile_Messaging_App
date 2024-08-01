import React from 'react'
import { View, Text, BackHandler } from 'react-native'
import { Link } from 'expo-router'

const settingsTab = () => {
    return (
        <View style={{
            justifyContent: "center",
            flex: 1,
            alignItems: "center",
            backgroundColor: 'orange'

        }} >
            <Link href={"/"} style={{
                fontSize: 20,
                color: 'white'
            }} >Settings Tab</Link>
        </View>
    )
}

export default settingsTab