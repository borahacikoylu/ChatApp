import React, { useContext, useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    Pressable,
    View,
    TextInput,
    Keyboard,
} from "react-native";
import { GlobalContext } from "../context";
import { socket } from "../utils";
import { useNavigation } from "@react-navigation/native";

const NewChatModal = () => {
    const { modalVisible, setModalVisible, currentUser } = useContext(GlobalContext);
    const [targetUsername, setTargetUsername] = useState("");
    const navigation = useNavigation();

    const handleStartConversation = () => {
        const trimmedTarget = targetUsername.trim();

        if (!trimmedTarget) {
            Alert.alert("Kullanıcı adı boş olamaz.");
            return;
        }

        if (trimmedTarget === currentUser) {
            Alert.alert("Kendinle sohbet başlatamazsın.");
            return;
        }

        socket.emit("start_conversation", {
            fromUser: currentUser,
            toUser: trimmedTarget,
        });

        socket.once("conversation_ready", ({ conversationId }) => {
            setModalVisible(false);
            setTargetUsername("");
            navigation.navigate("Messagescreen", {
                conversationId,
                partnerUsername: trimmedTarget,
            });
        });

        Keyboard.dismiss();
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Start Chat With</Text>

                    <TextInput
                        autoCorrect={false}
                        placeholder="Enter username (e.g. emir)"
                        style={styles.loginInput}
                        onChangeText={setTargetUsername}
                        value={targetUsername}
                    />

                    <View style={styles.buttonWrapper}>
                        <Pressable onPress={handleStartConversation} style={styles.button}>
                            <Text style={styles.buttonText}>Start</Text>
                        </Pressable>
                        <Pressable onPress={() => setModalVisible(false)} style={styles.button}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "90%",
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: "bold",
    },
    loginInput: {
        borderRadius: 50,
        borderWidth: 1,
        padding: 10,
        marginBottom: 15,
    },
    buttonWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    button: {
        flex: 1,
        backgroundColor: "#703efe",
        padding: 12,
        borderRadius: 50,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default NewChatModal;
