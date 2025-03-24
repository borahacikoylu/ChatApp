// screens/NewChatScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const NewChatScreen = ({ route }) => {
    const [email, setEmail] = useState('');
    const navigation = useNavigation();
    const currentUserEmail = route.params?.currentUserEmail;

    const handleStartChat = async () => {
        if (!email || email === currentUserEmail) {
            Alert.alert('Hata', 'Geçerli bir başka e-posta adresi girin.');
            return;
        }

        try {
            const chatsRef = firestore().collection('chats');

            // Aynı kullanıcılarla mevcut sohbet var mı kontrol et
            const existingChat = await chatsRef
                .where('users', 'in', [
                    [currentUserEmail, email],
                    [email, currentUserEmail],
                ])
                .get();

            if (!existingChat.empty) {
                const existingChatId = existingChat.docs[0].id;
                navigation.replace('Chat', { chatId: existingChatId, otherUser: email });
                return;
            }

            // Yeni sohbet oluştur
            const newChatRef = await chatsRef.add({
                users: [currentUserEmail, email],
                lastMessage: '',
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            navigation.replace('Chat', { chatId: newChatRef.id, otherUser: email });
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Sohbet başlatılamadı.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Sohbet Başlatmak İstediğiniz Kullanıcının E-postasını Girin:</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
            />
            <Button title="Sohbet Başlat" onPress={handleStartChat} />
        </View>
    );
};

export default NewChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
});
