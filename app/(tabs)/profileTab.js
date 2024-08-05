import { View, Text, Platform } from 'react-native'
import React from 'react'

const profileTab = () => {
    return (
        <View>
            {Platform.OS === 'android' ? <Text>This is runing on Android</Text> : <Text>This is runing on iPhone</Text>}
        </View>
    )
}

export default profileTab