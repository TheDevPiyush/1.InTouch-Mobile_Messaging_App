import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export default function CustomHeaderName({ username }) {
    return (
        <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.usernameStyle}>{username}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    usernameStyle: {
        color: 'white',
        fontSize: 17,
        fontFamily:'Outfit-Black-Bold'
    }
})
