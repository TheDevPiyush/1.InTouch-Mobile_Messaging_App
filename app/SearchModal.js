import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useNavigation } from "expo-router";

const SearchModal = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [focused, setFocused] = useState("");
    const [notFound, setNotFound] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        if (search.length > 0) {
            getUsers();
        } else {
            setUsers([]);
            setNotFound(false);
        }
    }, [search]);

    const [loaded] = useFonts({
        "Outfit-Black-Regular": require("../assets/Outfit-Regular.ttf"),
        "Outfit-Black-Medium": require("../assets/Outfit-Medium.ttf"),
        "Outfit-Black-Bold": require("../assets/Outfit-Bold.ttf"),
    });

    if (!loaded) {
        return null;
    }

    const getUsers = async () => {
        try {
            if (search.length > 4) {
                setNotFound(false);
                const usersRef = collection(firestore, "Users");
                const q = query(
                    usersRef,
                    where("uid", ">=", search),
                    where("uid", "<=", search + "\uf8ff")
                );
                const querySnapshot = await getDocs(q);
                const usersList = [];
                querySnapshot.forEach((doc) => {
                    usersList.push(doc.data());
                });
                setUsers(usersList);
                if (usersList.length === 0) setNotFound(true);
            }
        } catch (error) {
            setNotFound(true);
        }
    };

    const handleUserSelect = async (item) => {
        const currentUserUID = auth.currentUser.uid;
        const searchedUserUID = item.uid;
        await checkAndCreateChat(currentUserUID, searchedUserUID, item);
    };
    const getChatID = (uid1, uid2) => {
        return [uid1, uid2].sort().join("_");
    };

    const checkAndCreateChat = async (currentUserUID, searchedUserUID, item) => {
        try {
            const chatID = getChatID(currentUserUID, searchedUserUID);
            const chatDocRef = doc(firestore, "Chats", chatID);
            const chatDoc = await getDoc(chatDocRef);

            if (!chatDoc.exists()) {
                await setDoc(chatDocRef, {
                    participants: [currentUserUID, searchedUserUID],
                    createdAt: new Date(),
                });
            }
            navigation.goBack();
            router.push({
                pathname: "/[chatid]",
                params: {
                    username: item.username,
                    chatID: chatID,
                    searchedUserUID: searchedUserUID,
                    currentUserUID: currentUserUID,
                    userpicture: item.profilePicUrl,
                },
            });
        } catch (error) {
            Alert.alert("Something went wrong", "Could not create a conversation.");
        }
    };

    return (
        <View style={styles.container}>
            <View>
                <Text
                    style={{
                        marginVertical: 7,
                        fontSize: 15,
                        color: "rgba(128,128,128,0.6)",
                        fontFamily: "Outfit-Black-Medium",
                    }}
                >
                    Search a friend with their User ID.
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        focused === "search" && styles.focusInput,
                    ]}
                >
                    <TextInput
                        cursorColor={"#FF8C00"}
                        keyboardType="default"
                        returnKeyType="next"
                        onChangeText={(text) => setSearch(text.replace(/\s+/g, ""))}
                        onFocus={() => {
                            setFocused("search");
                        }}
                        style={styles.inputStyle}
                        value={search}
                        placeholder="EsuLKdf5u0gJr669iFJb0KdqNb42"
                        placeholderTextColor="rgba(128, 128,128,0.6)"
                    />
                </View>
            </View>
            {notFound ? (
                <Text
                    style={{
                        marginVertical: 10,
                        fontSize: 20,
                        color: "#FF8C00",
                        textAlign: "center",
                        fontWeight: "bold",
                    }}
                >
                    User not found!
                </Text>
            ) : (
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={users}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.searchItem}>
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => handleUserSelect(item)}
                                style={{ flexDirection: "row", alignItems: "center" }}
                            >
                                {item.profilePicUrl ? (
                                    <Image
                                        style={{ width: 45, height: 45, borderRadius: 50 }}
                                        source={{ uri: item.profilePicUrl }}
                                    />
                                ) : (
                                    <Ionicons name="person-circle" size={35} color={"#FF8c00"} />
                                )}
                                <Text style={styles.user}>{item.username}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#171722",
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        color: "white",
        marginBottom: 10,
    },
    inputContainer: {
        height: 55,
        backgroundColor: "#1f1f2d",
        borderRadius: 10,
    },
    inputStyle: {
        fontSize: 14,
        padding: 12,
        width: "100%",
        height: "100%",
        color: "white",
        fontFamily: "Outfit-Black-Medium",
    },
    focusInput: {
        borderWidth: 1,
        borderColor: "#FF8C00",
    },
    searchItem: {
        borderBottomColor: "rgba(128,128,128,0.3)",
        borderBottomWidth: 1,
        marginVertical: 5,
    },
    user: {
        color: "#ff9301",
        padding: 10,
        fontSize: 20,
        fontFamily: "Outfit-Black-Medium",
    },
});

export default SearchModal;
