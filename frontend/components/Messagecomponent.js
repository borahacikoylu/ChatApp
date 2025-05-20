import { StyleSheet, Text, View } from "react-native";

export default function Messagecomponent({ currentUserId, item }) {
    const isOwnMessage = item.sender_id === currentUserId;
    const formattedTime = item.timestamp
        ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

    return (
        <View style={[styles.messageWrapper, isOwnMessage ? styles.right : styles.left]}>
            <View
                style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                ]}
            >
                <Text style={isOwnMessage ? styles.ownText : styles.otherText}>
                    {item.text}
                </Text>
            </View>
            <Text style={styles.messageTime}>{formattedTime}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    messageWrapper: {
        maxWidth: "70%",
        marginBottom: 15,
    },
    left: {
        alignSelf: "flex-start",
    },
    right: {
        alignSelf: "flex-end",
    },
    messageBubble: {
        padding: 15,
        borderRadius: 15,
    },
    ownBubble: {
        backgroundColor: "#703efe",
    },
    otherBubble: {
        backgroundColor: "#f2f2f2",
    },
    ownText: {
        color: "#fff",
        fontSize: 15,
    },
    otherText: {
        color: "#000",
        fontSize: 15,
    },
    messageTime: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
        textAlign: "right",
    },
});
