import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'

const ProfilePicModal = () => {
    const { picUrl } = useLocalSearchParams()
    const [formatUrl, setFormatUrl] = useState(null)

    useEffect(() => {
        setFormatUrl(picUrl.replace('profile_pictures/', 'profile_pictures%2F'))
    }, [picUrl])
    return (
        <View style={styles.main}>
            {
                formatUrl === null
                    ?
                    <ActivityIndicator size={'large'} color={"#FF8C00"} />
                    :
                    <Image resizeMode='contain' source={{ uri: formatUrl }} style={styles.mainPic} />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        backgroundColor: 'black',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainPic: {
        width: '100%',
        height: "60%"
    }
})

export default ProfilePicModal