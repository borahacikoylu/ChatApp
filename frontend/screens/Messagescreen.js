import { useContext, useEffect, useState, useRef } from "react";
import {
    FlatList,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { GlobalContext } from "../context";
import Messagecomponent from "../components/Messagecomponent";
import { socket } from "../utils/index";

export default function Messagescreen({ route }) {
    const { conversationId, partnerUsername } = route.params;
    const {
        currentUser,
        currentUserId,
        currentChatMesage,
        setCurrentChatMessage,
    } = useContext(GlobalContext);

    const [allChatMessages, setAllChatMessages] = useState([]);
    const flatListRef = useRef(null);

    const handleAddNewMessage = () => {
        if (!currentChatMesage.trim()) return;

        socket.emit("send_message", {
            fromUser: currentUser,
            conversationId,
            message: currentChatMesage,
        });

        setCurrentChatMessage("");
        Keyboard.dismiss();
    };

    useEffect(() => {
        // ➕ Konuşma odasına katıl
        socket.emit("join_conversation", conversationId);

        // 📜 Geçmiş mesajları çekr
        socket.on("conversation_history", (messages) => {
            setAllChatMessages(messages);
        });

        // 📩 Yeni mesaj geldiğinde ekle
        socket.on("new_message", (msg) => {
            setAllChatMessages((prev) => [...prev, msg]);
        });

        // Temizlik
        return () => {
            socket.off("conversation_history");
            socket.off("new_message");
        };
    }, [conversationId]);

    useEffect(() => {
        if (allChatMessages.length > 0 && flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [allChatMessages]);

    return (
        <View style={styles.wrapper}>
            <View style={styles.chatArea}>
                <FlatList
                    ref={flatListRef}
                    data={allChatMessages}
                    renderItem={({ item }) => (
                        <Messagecomponent
                            item={item}
                            currentUserId={currentUserId}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />
            </View>

            <View style={styles.messageInputContainer}>
                <TextInput
                    style={styles.messageInput}
                    value={currentChatMesage}
                    onChangeText={setCurrentChatMessage}
                    placeholder={`Mesaj gönder (${partnerUsername})`}
                />

                <Pressable onPress={handleAddNewMessage} style={styles.button}>
                    <Text style={styles.buttonText}>SEND</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#eee",
    },
    chatArea: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    messageInputContainer: {
        flexDirection: "row",
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 50,
        padding: 15,
        marginRight: 10,
    },
    button: {
        backgroundColor: "#703efe",
        borderRadius: 50,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
