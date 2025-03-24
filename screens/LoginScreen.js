import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            // Giriş işlemi
            await auth().signInWithEmailAndPassword(email, password);

            // Giriş başarılıysa ChatList ekranına yönlendir
            navigation.replace('ChatList', { currentUserEmail: email });
        } catch (error) {
            Alert.alert('Giriş Hatası', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giriş Yap</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Şifre"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Giriş Yap" onPress={handleLogin} />

            <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
                Hesabın yok mu? Kayıt Ol
            </Text>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
    },
    link: {
        marginTop: 20,
        textAlign: 'center',
        color: 'blue',
        textDecorationLine: 'underline',
    },
});
