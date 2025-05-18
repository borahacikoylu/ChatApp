import {
    Alert,
    ImageBackground,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import homeImage from "../assets/home-image.jpg";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../context";
import { BaseUrl } from "../utils";

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

    return (
        <SafeAreaView style={styles.mainWrapper}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#081344', '#061757']}
                style={styles.content}
            >
                {showLoginView ? (
                    <View style={styles.loginContainer}>
                        <Text style={styles.welcomeText}>Welcome Back!</Text>
                        <Text style={styles.subText}>Please Log into your existing account</Text>
                        
                        <View style={styles.inputContainer}>
                            <TextInput
                                autoCorrect={false}
                                placeholder="Your Email"
                                placeholderTextColor="#9DA3B4"
                                style={styles.input}
                                onChangeText={(value) => setCurrentUserName(value)}
                                value={currentUserName}
                            />
                            
                            <TextInput
                                autoCorrect={false}
                                placeholder="Your Password"
                                placeholderTextColor="#9DA3B4"
                                style={styles.input}
                                onChangeText={(value) => setPassword(value)}
                                value={password}
                                secureTextEntry={true}
                            />
                        </View>
                        
                        <Pressable
                            onPress={() => handleRegisterAndSignIn(true)}
                            style={styles.loginButton}
                        >
                            <Text style={styles.loginButtonText}>Log In</Text>
                        </Pressable>
                        
                        <Pressable onPress={() => handleRegisterAndSignIn(false)}>
                            <Text style={styles.registerText}>
                                Don't have an account? <Text style={styles.registerLink}>Register</Text>
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.infoBlock}>
                        <Text style={styles.heading}>Connect, Grow and Inspire</Text>
                        <Text style={styles.subHeading}>
                            Connect people around the world for free
                        </Text>
                        <Pressable
                            style={styles.button}
                            onPress={() => setShowLoginView(true)}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </Pressable>
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: '#061757',
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingHorizontal: 20,
    },
    loginContainer: {
        width: "100%",
        alignItems: "center",
        padding: 20,
        maxWidth: 350,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
        textAlign: "center",
    },
    subText: {
        fontSize: 14,
        color: "#9DA3B4",
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        color: "#FFFFFF",
        width: "100%",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.1)",
    },
    loginButton: {
        backgroundColor: "#0CDA6E",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        marginBottom: 20,
        shadowColor: "#0CDA6E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    loginButtonText: {
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    registerText: {
        color: "#9DA3B4",
        fontSize: 14,
    },
    registerLink: {
        color: "#FFFFFF",
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
        marginBottom: 10,
    },
    subHeading: {
        fontSize: 15,
        color: "#9DA3B4",
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#0CDA6E",
        padding: 15,
        marginVertical: 10,
        width: "60%",
        borderRadius: 8,
        shadowColor: "#0CDA6E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 15,
    },
});
