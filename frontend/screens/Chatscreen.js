import { useContext, useEffect } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { GlobalContext } from "../context";
import { AntDesign } from "@expo/vector-icons";
import Chatcomponent from "../components/Chatcomponent";
import NewGroupModal from "../components/NewChatModal"; // istersen NewChatModal yap
import { socket, BaseUrl } from "../utils";

export default function Chatscreen({ navigation }) {
    const {
        currentUser,
        allChatRooms,
        setAllChatRooms,
        modalVisible,
        setModalVisible,
        setCurrentUser,
        setShowLoginView,
    } = useContext(GlobalContext);

    function handleLogout() {
        setCurrentUser("");
        setShowLoginView(false);
    }

    useEffect(() => {
        if (!currentUser) return;

        socket.emit("login", currentUser);

        fetch(`${BaseUrl}/my-conversations?username=${currentUser}`)
            .then((res) => res.json())
            .then((data) => {
                setAllChatRooms(data); // [{ conversation_id, partner_username }]
            })
            .catch((err) => console.error("Sohbet listesi alınamadı", err));
    }, [currentUser]);

    useEffect(() => {
        if (currentUser.trim() === "") navigation.navigate("Homescreen");
    }, [currentUser]);

    return (
        <View style={styles.mainWrapper}>
            <View style={styles.topContainer}>
                <View style={styles.header}>
                    <Text style={styles.heading}>Welcome {currentUser}!</Text>
                    <Pressable onPress={handleLogout}>
                        <AntDesign name="logout" size={30} color={"black"} />
                    </Pressable>
                </View>
            </View>

            <View style={styles.listContainer}>
                {allChatRooms && allChatRooms.length > 0 ? (
                    <FlatList
                        data={allChatRooms}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() =>
                                    navigation.navigate("Messagescreen", {
                                        conversationId: item.conversation_id,
                                        partnerUsername: item.partner_username,
                                    })
                                }
                            >
                                <Chatcomponent item={item} />
                            </Pressable>
                        )}
                        keyExtractor={(item) => item.conversation_id.toString()}
                    />
                ) : (
                    <Text style={{ textAlign: "center", marginTop: 20 }}>
                        No conversations yet.
                    </Text>
                )}
            </View>

            <View style={styles.bottomContainer}>
                <Pressable onPress={() => setModalVisible(true)} style={styles.button}>
                    <Text style={styles.buttonText}>Start New Chat</Text>
                </Pressable>
            </View>

            {modalVisible && <NewGroupModal />}
        </View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        backgroundColor: "#eee",
        flex: 1,
    },
    topContainer: {
        backgroundColor: "#fff",
        height: 70,
        width: "100%",
        padding: 20,
        justifyContent: "center",
        marginBottom: 15,
        flex: 0.3,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    heading: {
        fontSize: 30,
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    listContainer: {
        flex: 3.4,
        paddingHorizontal: 10,
    },
    bottomContainer: {
        flex: 0.3,
        padding: 10,
    },
    button: {
        backgroundColor: "#703efe",
        padding: 12,
        width: "100%",
        elevation: 1,
        borderRadius: 50,
    },
    buttonText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 20,
    },
});
