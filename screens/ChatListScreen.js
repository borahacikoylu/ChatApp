// screens/ChatListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChatListScreen = ({ route }) => {
    const [chats, setChats] = useState([]);
    const navigation = useNavigation();
    const currentUserEmail = route.params?.email;

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('chats')
            .where('users', 'array-contains', currentUserEmail)
            .onSnapshot(snapshot => {
                const chatList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setChats(chatList);
            });

        return unsubscribe;
    }, []);

    const renderItem = ({ item }) => {
        const otherUser = item.users.find(u => u !== currentUserEmail);
        const lastMessage = item.lastMessage || 'Henüz mesaj yok';

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => navigation.navigate('Chat', { chatId: item.id, otherUser })}
            >
                <Text style={styles.email}>{otherUser}</Text>
                <Text style={styles.message}>{lastMessage}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={chats}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NewChat', { currentUserEmail })}
            >
                <Icon name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default ChatListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    email: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    message: {
        color: '#555',
        marginTop: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#2196F3',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
});
