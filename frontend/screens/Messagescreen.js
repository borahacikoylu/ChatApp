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
    Image,
    Alert,
    ActivityIndicator
} from "react-native";
import { GlobalContext } from "../context";
import Messagecomponent from "../components/Messagecomponent";
import { socket, BaseUrl } from "../utils/index";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// Cloudinary sabitleri (Homescreen.js'den alındı)
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwoyqpbqk/image/upload";
const UPLOAD_PRESET = "ChatApp";

export default function Messagescreen({ route, navigation }) {
    console.log("[Messagescreen] Received route params:", JSON.stringify(route.params));

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const { conversationId, partnerUsername, partner_profile_image_url } = route.params;
    const {
        currentUser,
        currentUserId,
        currentChatMesage,
        setCurrentChatMessage,
        currentUserImage,
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
    const [isImageUploading, setIsImageUploading] = useState(false);
    
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

    const handleSendTextMessage = () => {
        if (!currentChatMesage.trim()) return;

        socket.emit("send_message", {
            fromUser: currentUser,
            conversationId,
            message: currentChatMesage,
            imageUrl: null,
        });
        animateSendButton();
        setCurrentChatMessage("");
        Keyboard.dismiss();
    };

    const handleSendImageMessage = async (imageUrl) => {
        console.log("[handleSendImageMessage] Fotoğraf gönderiliyor, URL:", imageUrl);
        const messageData = {
            fromUser: currentUser,
            conversationId,
            message: null,
            imageUrl: imageUrl,
        };
        console.log("[handleSendImageMessage] Socket'e gönderilecek veri:", JSON.stringify(messageData, null, 2));
        socket.emit("send_message", messageData);
        animateSendButton();
    };
    
    const animateSendButton = () => {
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
    };

    const pickAndUploadImage = async () => {
        console.log("pickAndUploadImage fonksiyonu çağrıldı.");
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("İzin Gerekli", "Galeriye erişim izni verilmedi.");
            console.log("Galeri izni verilmedi.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        console.log("ImagePicker sonucu:", JSON.stringify(result, null, 2));

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            console.log("Seçilen fotoğraf URI'si:", imageUri);
            setIsImageUploading(true);

            const formData = new FormData();
            formData.append("file", {
                uri: imageUri,
                name: `chatimg_${Date.now()}.jpg`,
                type: "image/jpeg",
            });
            formData.append("upload_preset", UPLOAD_PRESET);
            console.log("Cloudinary'e gönderilecek URI:", imageUri, "Preset:", UPLOAD_PRESET);

            try {
                console.log("Cloudinary'e yükleme deneniyor...");
                const uploadRes = await fetch(CLOUDINARY_URL, {
                    method: "POST",
                    body: formData,
                });
                const data = await uploadRes.json();
                console.log("Cloudinary yanıtı:", JSON.stringify(data, null, 2));

                if (data.secure_url) {
                    console.log("Cloudinary URL alındı:", data.secure_url);
                    await handleSendImageMessage(data.secure_url);
                } else {
                    console.error("Cloudinary URL alınamadı. Yanıt:", data);
                    throw new Error("Cloudinary URL alınamadı");
                }
            } catch (error) {
                Alert.alert("Hata", "Fotoğraf yüklenirken bir sorun oluştu.");
                console.error("Image upload error:", JSON.stringify(error, null, 2));
            } finally {
                setIsImageUploading(false);
            }
        } else {
            console.log("Fotoğraf seçimi iptal edildi veya sonuç varlıkları boş.");
        }
    };

    useEffect(() => {
        // ➕ Konuşma odasına katıl
        console.log(`[useEffect] Konuşma odasına katılıyor: ${conversationId}`);
        socket.emit("join_conversation", conversationId);

        // 📜 Geçmiş mesajları çeker
        socket.on("conversation_history", (messages) => {
            console.log("[socket.on] conversation_history alındı:", JSON.stringify(messages, null, 2));
            setAllChatMessages(messages);
        });

        // 📩 Yeni mesaj geldiğinde ekle
        socket.on("new_message", (msg) => {
            console.log("[socket.on] new_message alındı:", JSON.stringify(msg, null, 2));
            if (msg.conversation_id === conversationId) {
                console.log("[socket.on] Mesaj mevcut konuşmaya ait, listeye ekleniyor.");
                setAllChatMessages((prevMessages) => [...prevMessages, msg]);
                setNewMessageId(msg.id);
            } else {
                console.log("[socket.on] Mesaj farklı bir konuşmaya ait, listeye eklenmedi.", msg.conversation_id, conversationId);
            }
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
                    currentUserImage={currentUserImage}
                    partnerUserImage={partner_profile_image_url}
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

            <TouchableOpacity 
                onPress={pickAndUploadImage} 
                style={styles.imageButton}
                disabled={isImageUploading}
            >
                {isImageUploading ? (
                    <ActivityIndicator size="small" color="#5D5FEF" />
                ) : (
                    <Ionicons name="camera-outline" size={26} color="#5D5FEF" style={{opacity: 0.8}}/>
                )}
            </TouchableOpacity>

            <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity 
                    onPress={handleSendTextMessage}
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.partnerInfo}>
                    {partner_profile_image_url ? (
                        <Image source={{ uri: partner_profile_image_url }} style={styles.partnerImage} />
                    ) : (
                        <View style={styles.partnerImagePlaceholder}>
                            <Ionicons name="person" size={20} color="#FFF" />
                        </View>
                    )}
                    <Text style={styles.partnerName}>{partnerUsername}</Text>
                </View>
                {/* Sağ tarafta boşluk veya başka bir ikon için yer bırakılabilir (geri butonuyla denge için) */}
                <View style={{ width: styles.backButton?.padding * 2 + 24 || 40 }} /> 
            </View>
          </Animated.View>
      
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
      
            {/* 👇 Bu her platformda çalışır */}
            {renderMessageInput()}
          </KeyboardAvoidingView>
        </SafeAreaView>
      );
      
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    chatHeaderContainer: {
        backgroundColor: '#5D5FEF',
        paddingTop: Platform.OS === "android" ? 10 : 0, 
        paddingBottom: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    userInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    userInitial: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: 'bold',
    },
    username: {
        fontSize: 17,
        fontWeight: "600",
        color: "#FFFFFF",
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
    },
    imageButton: {
        padding: 8,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
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
    partnerInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    partnerImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
    },
    partnerImagePlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.3)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    partnerName: {
        fontSize: 17,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
