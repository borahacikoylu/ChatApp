import {
    Alert,
    ImageBackground,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
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
        setCurrentUserId, // ✅ kullanıcı ID'sini setleyeceğiz
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
                setCurrentUser(data.user.username);     // ✅ kullanıcı adı
                setCurrentUserId(data.user.id);         // ✅ kullanıcı ID
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
        <View style={styles.mainWrapper}>
            <ImageBackground source={homeImage} style={styles.homeImage} />
            <View style={styles.content}>
                {showLoginView ? (
                    <View style={styles.infoBlock}>
                        <View style={styles.loginInputContainer}>
                            <Text style={styles.heading}>Enter Your User Name</Text>
                            <TextInput
                                autoCorrect={false}
                                placeholder="Enter your user name"
                                style={styles.loginInput}
                                onChangeText={(value) => setCurrentUserName(value)}
                                value={currentUserName}
                            />
                            <TextInput
                                autoCorrect={false}
                                placeholder="Enter your password"
                                style={styles.loginInput}
                                onChangeText={(value) => setPassword(value)}
                                value={password}
                                secureTextEntry={true}
                            />
                        </View>
                        <View style={styles.buttonWrapper}>
                            <Pressable
                                onPress={() => handleRegisterAndSignIn(false)}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>Register</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleRegisterAndSignIn(true)}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>Login</Text>
                            </Pressable>
                        </View>
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
    },
    homeImage: {
        width: "100%",
        flex: 3,
        justifyContent: "center",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "#fff",
    },
    infoBlock: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 10,
    },
    subHeading: {
        fontSize: 15,
        color: "#acacac",
        marginBottom: 15,
    },
    loginInput: {
        borderRadius: 50,
        borderWidth: 1,
        padding: 8,
    },
    button: {
        backgroundColor: "#703efe",
        padding: 15,
        marginVertical: 10,
        width: "34%",
        elevation: 1,
        borderRadius: 50,
    },
    buttonWrapper: {
        flexDirection: "row",
        gap: 10,
    },
    buttonText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
    },
});
