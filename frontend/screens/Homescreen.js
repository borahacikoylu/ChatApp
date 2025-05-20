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
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../context";
import { BaseUrl } from "../utils";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from '@react-navigation/native';

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

    async function handleRegisterAndSignIn(isLogin) {
        if (currentUserName.trim() === "") {
            Alert.alert("User name field is empty");
            return;
        }

        try {
            const response = await fetch(`${BaseUrl}/${isLogin ? "login" : "register"}`, {
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
                setCurrentUserName("");
                
                // Giriş başarılı olduğunda navigation stack'i sıfırla
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Chatscreen' }],
                    })
                );
            } else {
                Alert.alert(data.message || "İşlem başarısız");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Sunucuya bağlanılamadı.");
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
                                            onPress={() => handleRegisterAndSignIn(true)}
                                            onPressIn={handlePressIn}
                                            onPressOut={handlePressOut}
                                            style={styles.loginButton}
                                        >
                                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                    
                                    <TouchableOpacity onPress={() => handleRegisterAndSignIn(false)} style={styles.registerButton}>
                                        <Text style={styles.registerText}>
                                            Hesabın yok mu? <Text style={styles.registerLink}>Kaydol</Text>
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        ) : (
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
                                        onPressIn={handlePressIn}
                                        onPressOut={handlePressOut}
                                    >
                                        <Text style={styles.buttonText}>Başla</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
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
    buttonIcon: {
        marginLeft: 5,
    },
});
