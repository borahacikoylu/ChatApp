import {
    Alert,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    View,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    BackHandler,
    Animated,
    Image,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../context";
import { BaseUrl } from "../utils";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwoyqpbqk/image/upload";
const UPLOAD_PRESET = "ChatApp";

export default function Homescreen({ navigation }) {
    const {
        showLoginView,
        setShowLoginView,
        currentUserName,
        setCurrentUserName,
        currentUser,
        setCurrentUser,
        setCurrentUserId,
        password,
        setPassword,
    } = useContext(GlobalContext);

    const [isRegistering, setIsRegistering] = useState(false);
    const [regUsername, setRegUsername] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirmPassword, setRegConfirmPassword] = useState("");
    const [regImageUri, setRegImageUri] = useState(null);
    const [regUploading, setRegUploading] = useState(false);

    // Buton animasyonları için değerler
    const buttonScale = useRef(new Animated.Value(1)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const loginFormOpacity = useRef(new Animated.Value(0)).current;
    const welcomeTextY = useRef(new Animated.Value(20)).current;
    
    const buttonAnimatedStyle = {
        transform: [{ scale: buttonScale }]
    };

    // Buton basma animasyonu
    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            friction: 5,
            tension: 300,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
        }).start();
    };

    async function handleLogin() {
        if (currentUserName.trim() === "") {
            Alert.alert("Kullanıcı adı boş olamaz");
            return;
        }
        if (password.trim() === "") {
            Alert.alert("Şifre boş olamaz");
            return;
        }

        try {
            const response = await fetch(`${BaseUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: currentUserName,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setCurrentUser(data.user.username);
                setCurrentUserId(data.user.id);
                
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Chatscreen' }],
                    })
                );
            } else {
                Alert.alert("Giriş Hatası", data.message || "Giriş işlemi başarısız oldu.");
            }
        } catch (err) {
            console.error("Login error:",err);
            Alert.alert("Bağlantı Hatası", "Sunucuya bağlanılamadı.");
        }
        Keyboard.dismiss();
    }

    useEffect(() => {
        if (currentUser.trim() !== "") {
            navigation.navigate("Chatscreen");
        }
    }, [currentUser]);
    
    // Android geri tuşunu kontrol et
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Eğer zaten giriş ekranındaysak, uygulamadan çık
            if (!currentUser.trim()) {
                BackHandler.exitApp();
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [currentUser]);

    // Sayfa ilk yüklendiğinde veya showLoginView değiştiğinde animasyonları oynat
    useEffect(() => {
        const animationTimeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(welcomeTextY, {
                    toValue: 0,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(loginFormOpacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ]).start();
        }, 100);

        return () => clearTimeout(animationTimeout);
    }, [showLoginView]);

    // Fotoğraf seçme fonksiyonu (Kayıt için)
    const pickImageForRegistration = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("İzin gerekli", "Galeriye erişim izni verilmedi.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7, // Kaliteyi biraz düşürerek yükleme süresini azaltabiliriz
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setRegImageUri(result.assets[0].uri);
        } else {
            // Kullanıcı fotoğraf seçmeyi iptal ederse veya bir sorun olursa
            // setRegImageUri(null); // Zaten null ise bir şey yapmaya gerek yok veya bir uyarı verilebilir
        }
    };

    // Asıl kayıt işlemini yapan fonksiyon
    const handleActualRegister = async () => {
        if (!regUsername.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen tüm kullanıcı adı ve şifre alanlarını doldurun.");
            return;
        }
        if (regPassword !== regConfirmPassword) {
            Alert.alert("Şifre Hatası", "Girilen şifreler eşleşmiyor.");
            return;
        }
        if (regPassword.length < 6) { // Örnek minimum şifre uzunluğu
            Alert.alert("Şifre Çok Kısa", "Şifreniz en az 6 karakter olmalıdır.");
            return;
        }

        setRegUploading(true); // Yükleme başladığını belirt
        let uploadedImageUrl = null;

        try {
            // Eğer kullanıcı bir fotoğraf seçtiyse, Cloudinary'e yükle
            if (regImageUri) {
                const formData = new FormData();
                formData.append("file", {
                    uri: regImageUri,
                    name: `profile_${Date.now()}.jpg`, // Benzersiz bir isim
                    type: "image/jpeg", 
                });
                formData.append("upload_preset", UPLOAD_PRESET);

                const uploadRes = await fetch(CLOUDINARY_URL, {
                    method: "POST",
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                
                if (uploadData.secure_url) {
                    uploadedImageUrl = uploadData.secure_url;
                } else {
                    throw new Error("Cloudinary yükleme hatası veya URL alınamadı.");
                }
            }

            // Backend'e kayıt isteği gönder
            const response = await fetch(`${BaseUrl}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: regUsername,
                    password: regPassword,
                    imageUrl: uploadedImageUrl, // Yüklenmiş URL veya null
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Kayıt Başarılı", "Hesabınız oluşturuldu! Giriş yapabilirsiniz.");
                // Global context'i doğrudan güncellemek yerine, kullanıcıyı giriş yapmaya yönlendirmek daha iyi olabilir.
                // Veya doğrudan giriş yapmasını sağlayabiliriz:
                // setCurrentUser(data.user.username);
                // setCurrentUserId(data.user.id);
                // navigation.dispatch(
                // CommonActions.reset({
                // index: 0,
                // routes: [{ name: 'Chatscreen' }],
                // })
                // );
                
                // Kayıt sonrası state'leri temizle ve giriş ekranına/ana ekrana yönlendir
                setIsRegistering(false);
                setShowLoginView(true); // Giriş formunu göster
                setRegUsername("");
                setRegPassword("");
                setRegConfirmPassword("");
                setRegImageUri(null);

            } else {
                Alert.alert("Kayıt Hatası", data.message || "Kayıt işlemi başarısız oldu.");
            }

        } catch (err) {
            console.error("Registration error:", err);
            Alert.alert("Hata", "Kayıt sırasında bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.");
        }
        setRegUploading(false); // Yükleme bitti
        Keyboard.dismiss();
    };

    return (
        <SafeAreaView style={styles.mainWrapper}>
            <StatusBar barStyle="light-content" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <LinearGradient
                        colors={['#2E2F5B', '#1A1B47', '#070F2D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.content}
                    >
                        {showLoginView ? (
                            <View style={styles.loginContainer}>
                                <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
                                    <Ionicons name="chatbubbles" size={60} color="#5D5FEF" />
                                    <Text style={styles.appName}>ChatApp</Text>
                                </Animated.View>
                                
                                <Animated.View 
                                    style={{
                                        transform: [{ translateY: welcomeTextY }],
                                        opacity: logoOpacity
                                    }}
                                >
                                    <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
                                    <Text style={styles.subText}>Hesabınıza giriş yapın</Text>
                                </Animated.View>
                                
                                <Animated.View style={[styles.inputContainer, { opacity: loginFormOpacity }]}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="person-outline" size={22} color="#9DA3B4" style={styles.inputIcon} />
                                        <TextInput
                                            autoCorrect={false}
                                            placeholder="Kullanıcı Adı"
                                            placeholderTextColor="#9DA3B4"
                                            style={styles.input}
                                            onChangeText={(value) => setCurrentUserName(value)}
                                            value={currentUserName}
                                        />
                                    </View>
                                    
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={22} color="#9DA3B4" style={styles.inputIcon} />
                                        <TextInput
                                            autoCorrect={false}
                                            placeholder="Şifre"
                                            placeholderTextColor="#9DA3B4"
                                            style={styles.input}
                                            onChangeText={(value) => setPassword(value)}
                                            value={password}
                                            secureTextEntry={true}
                                        />
                                    </View>
                                
                                    <Animated.View style={buttonAnimatedStyle}>
                                        <TouchableOpacity
                                            onPress={handleLogin}
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.loginButton}
                                        >
                                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                    
                                    <TouchableOpacity onPress={() => { setShowLoginView(false); setIsRegistering(true); }} style={styles.registerButton}>
                                        <Text style={styles.registerText}>
                                            Hesabın yok mu? <Text style={styles.registerLink}>Kaydol</Text>
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        ) : (
                            !isRegistering && (
                            <View style={styles.infoBlock}>
                                <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
                                    <Ionicons name="chatbubbles" size={80} color="#5D5FEF" />
                                    <Text style={styles.appName}>ChatApp</Text>
                                </Animated.View>
                                
                                <Animated.View 
                                    style={{
                                        transform: [{ translateY: welcomeTextY }],
                                        opacity: logoOpacity
                                    }}
                                >
                                    <Text style={styles.heading}>Bağlan, Geliş, İlham Al</Text>
                                    <Text style={styles.subHeading}>
                                        Dünya çapında insanlarla ücretsiz bağlantı kur
                                    </Text>
                                </Animated.View>
                                
                                <Animated.View style={buttonAnimatedStyle}>
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => setShowLoginView(true)}
                                    >
                                        <Text style={styles.buttonText}>Giriş Yap</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                                <TouchableOpacity onPress={() => setIsRegistering(true)} style={[styles.button, {marginTop: 20, backgroundColor: '#4A4C7D'}]}>
                                    <Text style={styles.buttonText}>Kaydol</Text>
                                </TouchableOpacity>
                            </View>
                            )
                        )}
                        {isRegistering && (
                            <View style={styles.loginContainer}>
                                <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, marginBottom: 20 }]}>
                                    <Ionicons name="person-add-outline" size={60} color="#5D5FEF" />
                                    <Text style={styles.appName}>Yeni Hesap Oluştur</Text>
                                </Animated.View>

                                <Animated.View style={[styles.inputContainer, { opacity: loginFormOpacity }]}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="person-outline" size={22} color="#9DA3B4" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Kullanıcı Adı"
                                            placeholderTextColor="#9DA3B4"
                                            style={styles.input}
                                            value={regUsername}
                                            onChangeText={setRegUsername}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={22} color="#9DA3B4" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Şifre"
                                            placeholderTextColor="#9DA3B4"
                                            style={styles.input}
                                            secureTextEntry
                                            value={regPassword}
                                            onChangeText={setRegPassword}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={22} color="#9DA3B4" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Şifre Tekrar"
                                            placeholderTextColor="#9DA3B4"
                                            style={styles.input}
                                            secureTextEntry
                                            value={regConfirmPassword}
                                            onChangeText={setRegConfirmPassword}
                                        />
                                    </View>

                                    <TouchableOpacity onPress={pickImageForRegistration} style={styles.imagePickerButton}>
                                        <Ionicons name="camera-outline" size={22} color="#FFF" style={{marginRight: 10}} />
                                        <Text style={styles.imagePickerButtonText}>
                                            {regImageUri ? "Fotoğraf Seçildi" : "Profil Fotoğrafı Seç"}
                                        </Text>
                                    </TouchableOpacity>
                                    {regImageUri && (
                                        <Image source={{ uri: regImageUri }} style={styles.selectedImage} />
                                    )}

                                    <Animated.View style={[buttonAnimatedStyle, { marginTop: 25 }]}>
                                        <TouchableOpacity
                                            onPress={handleActualRegister}
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.loginButton}
                                            disabled={regUploading}
                                        >
                                            {regUploading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={styles.loginButtonText}>Kaydı Tamamla</Text>
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
                                    
                                    <TouchableOpacity onPress={() => {setIsRegistering(false); setShowLoginView(false);}} style={styles.registerButton}>
                                        <Text style={styles.registerText}>Giriş Ekranına Dön</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        )}
                    </LinearGradient>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: '#070F2D',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    appName: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 10,
    },
    loginContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        maxWidth: 350,
        flex: 1,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
        textAlign: "center",
    },
    subText: {
        fontSize: 16,
        color: "#9DA3B4",
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "rgba(93, 95, 239, 0.3)",
    },
    inputIcon: {
        padding: 15,
    },
    input: {
        flex: 1,
        padding: 15,
        color: "#FFFFFF",
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: "#5D5FEF",
        padding: 16,
        borderRadius: 12,
        width: "100%",
        marginBottom: 20,
        shadowColor: "#5D5FEF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    registerButton: {
        padding: 10,
        width: "100%",
        alignItems: "center",
    },
    registerText: {
        color: "#9DA3B4",
        fontSize: 15,
        textAlign: "center",
    },
    registerLink: {
        color: "#5D5FEF",
        fontWeight: "bold",
    },
    infoBlock: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 15,
        textAlign: "center",
    },
    subHeading: {
        fontSize: 16,
        color: "#9DA3B4",
        marginBottom: 30,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#5D5FEF",
        paddingVertical: 16,
        paddingHorizontal: 30,
        marginVertical: 10,
        borderRadius: 12,
        shadowColor: "#5D5FEF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
        marginRight: 8,
    },
    imagePickerButton: {
        flexDirection: 'row',
        backgroundColor: '#5D5FEF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        opacity: 0.9,
    },
    imagePickerButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '500',
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 15,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#5D5FEF',
    }
});
