import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            await auth().createUserWithEmailAndPassword(email, password);
            navigation.navigate('Chat');
        } catch (error) {
            Alert.alert('Kayıt Hatası', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kayıt Ol</Text>
            <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} />
            <TextInput style={styles.input} placeholder="Şifre" secureTextEntry onChangeText={setPassword} value={password} />
            <Button title="Kayıt Ol" onPress={handleRegister} />
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Zaten hesabın var mı? Giriş yap</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
    link: { marginTop: 20, textAlign: 'center', color: 'blue' },
});

export default RegisterScreen;
