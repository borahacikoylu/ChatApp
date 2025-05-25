import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    TextInput,
    ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { GlobalContext } from "../context";
import { BaseUrl } from "../utils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwoyqpbqk/image/upload";
const UPLOAD_PRESET = "ChatApp";

export default function Profilescreen({ navigation }) {
    const { currentUser } = useContext(GlobalContext);
    const [imageUrl, setImageUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const response = await fetch(`${BaseUrl}/get-profile-image?username=${currentUser}`);
                const data = await response.json();
                if (data.imageUrl) {
                    setImageUrl(data.imageUrl);
                }
            } catch (error) {
                console.error("Error fetching profile image:", error);
                // Optionally, show an alert to the user
                // Alert.alert("Hata", "Profil fotoğrafı yüklenemedi.");
            }
        };

        if (currentUser) {
            fetchProfileImage();
        }
    }, [currentUser]);

    const pickImageAndUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("İzin gerekli", "Galeriye erişim izni verilmedi.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setUploading(true);

            const formData = new FormData();
            formData.append("file", {
                uri: result.assets[0].uri,
                name: "profile.jpg",
                type: "image/jpeg",
            });
            formData.append("upload_preset", UPLOAD_PRESET);

            try {
                const uploadRes = await fetch(CLOUDINARY_URL, {
                    method: "POST",
                    body: formData,
                });
                const data = await uploadRes.json();
                setImageUrl(data.secure_url);

                // URL'yi backend'e gönder
                await fetch(`${BaseUrl}/update-profile-image`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: currentUser,
                        imageUrl: data.secure_url,
                    }),
                });

                Alert.alert("Başarılı", "Profil fotoğrafınız güncellendi.");
            } catch (error) {
                Alert.alert("Hata", "Fotoğraf yüklenemedi.");
                console.error(error);
            }

            setUploading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("Hata", "Lütfen tüm şifre alanlarını doldurun.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Hata", "Yeni şifreler eşleşmiyor.");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalıdır.");
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await fetch(`${BaseUrl}/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: currentUser,
                    currentPassword,
                    newPassword,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                Alert.alert("Başarılı", data.message);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                Alert.alert("Hata", data.message || "Şifre değiştirilemedi.");
            }
        } catch (error) {
            Alert.alert("Hata", "Bir sorun oluştu. Lütfen tekrar deneyin.");
            console.error("Change password error:", error);
        }
        setIsChangingPassword(false);
    };

    return (
        <SafeAreaView style={styles.wrapper}>
            <LinearGradient
                colors={["#2E2F5B", "#1A1B47", "#070F2D"]}
                style={styles.header}
            >
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Profilim</Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="person-circle-outline" size={120} color="#ccc" />
                    )}

                    <Text style={styles.username}>{currentUser}</Text>

                    <TouchableOpacity style={styles.button} onPress={pickImageAndUpload}>
                        {uploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Fotoğraf Yükle</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.passwordChangeContainer}>
                        <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mevcut Şifre"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholderTextColor="#888"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Yeni Şifre"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholderTextColor="#888"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Yeni Şifre Tekrar"
                            secureTextEntry
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            placeholderTextColor="#888"
                        />
                        <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={isChangingPassword}>
                            {isChangingPassword ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Şifreyi Değiştir</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: "#F5F7FA" },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 8,
    },
    headerText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    },
    content: {
        alignItems: "center",
        marginTop: 40,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
    },
    username: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#5D5FEF",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginTop: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    passwordChangeContainer: {
        width: '90%',
        marginTop: 30,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        color: '#333',
    },
});