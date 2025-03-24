import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ChatScreen from './screens/ChatScreen';
import ChatListScreen from './screens/ChatListScreen'; // ✅ BURASI

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ChatList" component={ChatListScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
