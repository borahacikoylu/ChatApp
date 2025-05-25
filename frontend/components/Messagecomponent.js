import { StyleSheet, Text, View, Image, TouchableOpacity, Linking, Dimensions } from "react-native";

export default function Messagecomponent({ currentUserId, item, currentUserImage, partnerUserImage }) {
    const isOwnMessage = item.sender_id === currentUserId;
    const formattedTime = item.timestamp
        ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";

    const userImage = isOwnMessage ? currentUserImage : partnerUserImage;
    const hasImage = !!item.image_url;
    const hasText = !!item.text;

    // Dinamik stilleri burada oluşturalım
    const bubbleStyle = [
        styles.messageBubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble,
    ];

    if (hasImage && !hasText) {
        bubbleStyle.push(styles.imageOnlyBubble);
    }

    const openImageFullscreen = () => {
        if (item.image_url) {
            Linking.openURL(item.image_url).catch(err => console.error("URL açılamadı", err));
        }
    };

    return (
        <View style={[styles.messageContainer, isOwnMessage ? styles.rightAlign : styles.leftAlign]}>
            {!isOwnMessage && userImage && (
                <Image source={{ uri: userImage }} style={styles.avatar} />
            )}
            <View style={[styles.messageWrapper, isOwnMessage ? styles.right : styles.left]}>
                <View
                    style={bubbleStyle}
                >
                    {hasImage && (
                        <TouchableOpacity onPress={openImageFullscreen}>
                            <Image 
                                source={{ uri: item.image_url }} 
                                style={styles.messageImage} 
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    )}
                    {hasText && (
                        <Text style={isOwnMessage ? styles.ownText : styles.otherText}>
                            {item.text}
                        </Text>
                    )}
                </View>
                <Text style={[styles.messageTime, isOwnMessage ? styles.timeRight : styles.timeLeft]}>{formattedTime}</Text>
            </View>
            {isOwnMessage && userImage && (
                <Image source={{ uri: userImage }} style={styles.avatar} />
            )}
        </View>
    );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 15,
        maxWidth: "85%",
    },
    leftAlign: {
        alignSelf: "flex-start",
    },
    rightAlign: {
        alignSelf: "flex-end",
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginHorizontal: 8,
        marginBottom: 5,
    },
    messageWrapper: {
        maxWidth: "100%",
    },
    left: {
    },
    right: {
    },
    messageBubble: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 18,
        overflow: 'hidden',
    },
    imageOnlyBubble: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    ownBubble: {
        backgroundColor: "#703efe",
    },
    otherBubble: {
        backgroundColor: "#E5E5EA",
    },
    ownText: {
        color: "#fff",
        fontSize: 15,
    },
    otherText: {
        color: "#000",
        fontSize: 15,
    },
    messageImage: {
        width: windowWidth * 0.6,
        height: windowWidth * 0.6 * (4/3),
        borderRadius: 15,
    },
    messageTime: {
        fontSize: 11,
        opacity: 0.6,
        marginTop: 4,
    },
    timeLeft: {
        textAlign: "left",
        marginLeft: 5,
    },
    timeRight: {
        textAlign: "right",
        marginRight: 5,
    },
});
