import { StyleSheet, Text, View, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useContext } from "react";
import { GlobalContext } from "../context";

export default function Chatcomponent({ item }) {
    const { currentUserId } = useContext(GlobalContext);

    let lastMessageDisplay = "Tap to start messaging";
    let displayTime = "Now";

    if (item.last_message_timestamp) {
        const date = new Date(item.last_message_timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        displayTime = `${hours}:${minutes}`;

        if (item.last_message_image_url && !item.last_message_text) {
            lastMessageDisplay = "Image";
        } else if (item.last_message_text) {
            if (item.last_message_sender_id === currentUserId) {
                lastMessageDisplay = `Siz: ${item.last_message_text}`;
            } else {
                lastMessageDisplay = `${item.partner_username}: ${item.last_message_text}`;
            }
        } else if (item.last_message_image_url && item.last_message_text) {
            if (item.last_message_sender_id === currentUserId) {
                lastMessageDisplay = `Siz: Image`;
            } else {
                lastMessageDisplay = `${item.partner_username}: Image`;
            }
        }
    }
    
    const MAX_LENGTH = 25;
    if (lastMessageDisplay.length > MAX_LENGTH && lastMessageDisplay !== "Image") {
        lastMessageDisplay = lastMessageDisplay.substring(0, MAX_LENGTH - 3) + "...";
    }

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
                <View style={styles.messageDetails}>
                    <Text style={styles.userName}>{item.partner_username}</Text>
                    <Text style={styles.message} numberOfLines={1} ellipsizeMode="tail">{lastMessageDisplay}</Text>
                </View>
                <View style={styles.timeContainer}>
                    <Text style={styles.time}>{displayTime}</Text>
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
        borderRadius: 12,
        padding: 15,
        backgroundColor: "#FFFFFF",
        height: 85,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 12,
    },
    circle: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E9E9E9",
        marginRight: 12,
    },
    rightContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
        alignItems: "center",
    },
    messageDetails: {
        flex: 1,
        marginRight: 8,
    },
    userName: {
        fontSize: 17,
        marginBottom: 4,
        fontWeight: "600",
        color: "#333333",
    },
    message: {
        fontSize: 14,
        color: "#666666",
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    time: {
        color: "#888888",
        fontSize: 12,
    },
});