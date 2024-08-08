import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig'; // Adjust the import based on your setup
import { useNavigation } from 'expo-router';

const ChatsTab = () => {

    useEffect(() => {
    }, []);

    return (
        <ScrollView>
            <Text> Chattin</Text>
        </ScrollView>
    );
};

export default ChatsTab;
