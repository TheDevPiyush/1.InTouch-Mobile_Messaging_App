import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { collection, query, where, getDocs, startAt, endAt } from "firebase/firestore";
import { firestore } from '../firebaseConfig';

const SearchModal = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [focused, setFocused] = useState('')
    const [notFound, setNotFound] = useState(false)
    useEffect(() => {
        if (search.length > 0) {
            getUsers();
        } else {
            setUsers([]);
            setNotFound(false)
        }
    }, [search]);

    const getUsers = async () => {
        try {
            setNotFound(false)
            const usersRef = collection(firestore, "Users");
            const q = query(usersRef, where("username", ">=", search), where("username", "<=", search + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const usersList = [];
            querySnapshot.forEach((doc) => {
                usersList.push(doc.data());
            });
            setUsers(usersList);
            if (usersList.length === 0) setNotFound(true)
        } catch (error) {
            setNotFound(true)
        }
    }

    const [loaded] = useFonts({
        'Outfit-Black-Regular': require('../assets/Outfit-Regular.ttf'),
        'Outfit-Black-Medium': require('../assets/Outfit-Medium.ttf'),
        'Outfit-Black-Bold': require('../assets/Outfit-Bold.ttf'),
    });

    if (!loaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View>
                <Text style={{ marginVertical: 10, fontSize: 17, color: '#FF8C00' }}>Search a user</Text>
                <View
                    style={[
                        styles.inputContainer, focused === "search"
                        && styles.focusInput]}>
                    <TextInput
                        keyboardType='default'
                        returnKeyType='next'
                        onChangeText={text => setSearch(text.toLowerCase())}
                        onFocus={() => { setFocused("search") }}
                        style={styles.inputStyle}
                        value={search}
                        placeholder="peterparker@22"
                        placeholderTextColor='rgba(128, 128,128,0.6)'
                    />
                </View>
            </View>
            {notFound ? <Text style={{
                marginVertical: 10, fontSize: 15, color: '#FF8C00', textAlign: 'center', fontWeight: 'bold'
            }}>User not found!</Text>

                : <FlatList
                    data={users}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Text style={styles.user}>{item.username}</Text>
                    )}
                />}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#171722",
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        color: 'white',
        marginBottom: 10,
    },
    inputContainer: {
        height: 55,
        backgroundColor: "#1f1f2d",
        borderRadius: 10,
        marginVertical: 5
    },
    inputStyle: {
        fontSize: 20,
        padding: 12, width: '100%', height: '100%', color: 'white',
        fontFamily: 'Outfit-Black-Medium'
    },
    focusInput: {
        borderWidth: 1,
        borderColor: '#FF8C00'
    },
    user: {
        color: 'white',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    }
});

export default SearchModal;
