import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import auth from '@react-native-firebase/auth';

const socket = io('http://10.0.2.2:3000'); // Emülatör için localhost

const ChatScreen = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(user => {
            if (user) {
                socket.emit('connectUser', user.uid);
            }
        });

        socket.on('receiveMessage', data => {
            setMessages(prev => [...prev, data]);
        });

        return () => {
            unsubscribe();
            socket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        auth().currentUser?.uid && socket.emit('sendMessage', {
            uid: auth().currentUser.uid,
            message
        });
        setMessage('');
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Text>{item.uid}: {item.message}</Text>
                )}
            />
            <TextInput
                style={styles.input}
                placeholder="Mesaj yaz..."
                value={message}
                onChangeText={setMessage}
            />
            <Button title="Gönder" onPress={sendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 40 },
    input: { borderWidth: 1, padding: 10, marginVertical: 10 }
});

export default ChatScreen;
