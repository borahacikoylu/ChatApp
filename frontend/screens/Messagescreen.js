import { useContext, useEffect, useState, useRef } from "react";
import {
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    InputAccessoryView,
    Animated,
    Easing,
} from "react-native";
import { GlobalContext } from "../context";
import Messagecomponent from "../components/Messagecomponent";
import { socket } from "../utils/index";
import { Ionicons } from "@expo/vector-icons";

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
    const inputRef = useRef(null);
    
    // Animasyon için değerler
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const inputTranslateY = useRef(new Animated.Value(20)).current;
    const inputOpacity = useRef(new Animated.Value(0)).current;
    const [newMessageId, setNewMessageId] = useState(null);
    
    // Mesaj animasyonları için
    const messageAnimations = useRef(new Map()).current;
    
    const buttonAnimatedStyle = {
        transform: [{ scale: buttonScale }]
    };

    // Buton basma animasyonu
    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.9,
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

    // Sayfa başlangıç animasyonları
    useEffect(() => {
        const animationTimeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(headerOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(inputOpacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.spring(inputTranslateY, {
                    toValue: 0,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);

        return () => clearTimeout(animationTimeout);
    }, []);

    // Yeni mesaj animasyonları
    useEffect(() => {
        if (newMessageId) {
            const scale = new Animated.Value(0.9);
            const opacity = new Animated.Value(0.5);
            
            messageAnimations.set(newMessageId, {
                scale,
                opacity
            });
            
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setTimeout(() => setNewMessageId(null), 500);
            });
        }
    }, [newMessageId]);

    const handleAddNewMessage = () => {
        if (!currentChatMesage.trim()) return;

        socket.emit("send_message", {
            fromUser: currentUser,
            conversationId,
            message: currentChatMesage,
        });

        // Mesaj gönderme animasyonu
        Animated.sequence([
            Animated.spring(buttonScale, {
                toValue: 0.85,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScale, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        setCurrentChatMessage("");
        Keyboard.dismiss();
    };

    useEffect(() => {
        // ➕ Konuşma odasına katıl
        socket.emit("join_conversation", conversationId);

        // 📜 Geçmiş mesajları çeker
        socket.on("conversation_history", (messages) => {
            setAllChatMessages(messages);
        });

        // 📩 Yeni mesaj geldiğinde ekle
        socket.on("new_message", (msg) => {
            setAllChatMessages((prev) => [...prev, msg]);
            setNewMessageId(msg.id);
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

    const inputAccessoryViewID = "uniqueInputAccessoryViewID";

    // Mesaj öğesi render işlevi - Hook kullanmadan
    const renderMessageItem = ({ item }) => {
        // Mesaj için animasyon değerlerini al veya varsayılan değerleri kullan
        const messageAnim = messageAnimations.get(item.id);
        const isNewMessage = item.id === newMessageId;
        
        // Stil nesnesini oluştur
        const messageAnimStyle = isNewMessage && messageAnim ? {
            transform: [{ scale: messageAnim.scale }],
            opacity: messageAnim.opacity
        } : {};
        
        return (
            <Animated.View style={messageAnimStyle}>
                <Messagecomponent
                    item={item}
                    currentUserId={currentUserId}
                />
            </Animated.View>
        );
    };

    const renderMessageInput = () => (
        <Animated.View style={[
            styles.messageInputContainer, 
            { 
                opacity: inputOpacity,
                transform: [{ translateY: inputTranslateY }]
            }
        ]}>
            <View style={styles.inputWrapper}>
                <TextInput
                    ref={inputRef}
                    style={styles.messageInput}
                    value={currentChatMesage}
                    onChangeText={setCurrentChatMessage}
                    placeholder={`${partnerUsername} kullanıcısına mesaj gönder`}
                    placeholderTextColor="#9DA3B4"
                    multiline
                    maxHeight={80}
                    inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
                />
            </View>

            <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity 
                    onPress={handleAddNewMessage} 
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.sendButton}
                    activeOpacity={0.8}
                    disabled={!currentChatMesage.trim()}
                >
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.wrapper}>
            <Animated.View style={[styles.chatHeaderContainer, { opacity: headerOpacity }]}>
                <View style={styles.chatHeader}>
                    <View style={styles.userInfoContainer}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userInitial}>
                                {partnerUsername.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.username}>{partnerUsername}</Text>
                    </View>
                </View>
            </Animated.View>

            {Platform.OS === 'android' ? (
                <KeyboardAvoidingView 
                    style={styles.chatArea}
                    behavior="height"
                    keyboardVerticalOffset={100}
                >
                    <FlatList
                        ref={flatListRef}
                        data={allChatMessages}
                        renderItem={renderMessageItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.messageList}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyChatContainer}>
                                <View style={styles.emptyIconContainer}>
                                    <Ionicons name="chatbubbles-outline" size={60} color="#CCCCCC" />
                                </View>
                                <Text style={styles.emptyChatText}>
                                    Henüz mesaj yok. Konuşmaya başlayın!
                                </Text>
                            </View>
                        )}
                    />
                    {renderMessageInput()}
                </KeyboardAvoidingView>
            ) : (
                <>
                    <View style={styles.chatArea}>
                        <FlatList
                            ref={flatListRef}
                            data={allChatMessages}
                            renderItem={renderMessageItem}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.messageList}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyChatContainer}>
                                    <View style={styles.emptyIconContainer}>
                                        <Ionicons name="chatbubbles-outline" size={60} color="#CCCCCC" />
                                    </View>
                                    <Text style={styles.emptyChatText}>
                                        Henüz mesaj yok. Konuşmaya başlayın!
                                    </Text>
                                </View>
                            )}
                        />
                    </View>

                    <InputAccessoryView nativeID={inputAccessoryViewID}>
                        {renderMessageInput()}
                    </InputAccessoryView>

                    {Platform.OS === 'ios' && (
                        <View style={styles.messageInputPlaceholder} />
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    chatHeaderContainer: {
        backgroundColor: "#5D5FEF",
        paddingTop: 10,
        paddingBottom: 15,
    },
    chatHeader: {
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    userInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#3E3F8F",
        justifyContent: "center",
        alignItems: "center",
    },
    userInitial: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    username: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 10,
    },
    chatArea: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    emptyChatContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
        minHeight: 300,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyChatText: {
        fontSize: 16,
        color: "#999999",
        textAlign: "center",
    },
    messageList: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexGrow: 1,
    },
    messageInputContainer: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: "#FFFFFF",
        alignItems: "flex-end",
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
    },
    messageInputPlaceholder: {
        height: 60,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: "#F5F7FA",
        borderRadius: 24,
        paddingHorizontal: 5,
        marginRight: 10,
        minHeight: 48,
        maxHeight: 120,
    },
    messageInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: "#2C2D5A",
        maxHeight: 80,
    },
    sendButton: {
        backgroundColor: "#5D5FEF",
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#5D5FEF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
});
