import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Login from './Login';

const Index = () => {

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Login />
        </GestureHandlerRootView>
    );
};

export default Index;
