import { View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const profileTab = () => {
    return (
        <View style={{

            justifyContent: "center",
            flex: 1,
            alignItems: "center",
            backgroundColor: 'dodgerblue'

        }}>
            <Link href={"/"} style={{
                fontSize: 20,
                color: 'white'
            }} >Profile Tab</Link>
        </View>
    )
}

export default profileTab