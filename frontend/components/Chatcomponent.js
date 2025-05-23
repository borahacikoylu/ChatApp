import { StyleSheet, Text, View, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Chatcomponent({ item }) {
    return (
        <View style={styles.chat}>
            {item.partner_profile_image_url ? (
                <Image source={{ uri: item.partner_profile_image_url }} style={styles.avatar} />
            ) : (
                <View style={styles.circle}>
                    <FontAwesome name="user" size={24} color={"black"} />
                </View>
            )}
            <View style={styles.rightContainer}>
                <View>
                    <Text style={styles.userName}>{item.partner_username}</Text>
                    <Text style={styles.message}>Tap to start messaging</Text>
                </View>
                <View>
                    <Text style={styles.time}>Now</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chat: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        padding: 10,
        backgroundColor: "#fff",
        height: 80,
        marginBottom: 10,
    },
    userName: {
        fontSize: 18,
        marginBottom: 5,
        fontWeight: "bold",
    },
    message: {
        fontSize: 14,
        opacity: 0.8,
    },
    rightContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
    },
    time: {
        opacity: 0.6,
        fontSize: 12,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#ddd",
        marginRight: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
});