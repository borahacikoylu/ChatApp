import { useContext, useEffect, useRef, useState, useCallback } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    BackHandler,
    Animated,
} from "react-native";
import { GlobalContext } from "../context";
import { Ionicons } from "@expo/vector-icons";
import Chatcomponent from "../components/Chatcomponent";
import NewGroupModal from "../components/NewChatModal"; // istersen NewChatModal yap
import { socket, BaseUrl } from "../utils";
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions, useFocusEffect } from '@react-navigation/native';

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

    // Animasyon değerleri
    const buttonScale = useRef(new Animated.Value(1)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const listTranslateY = useRef(new Animated.Value(50)).current;
    const listOpacity = useRef(new Animated.Value(0)).current;
    
    // Chat öğeleri için animasyon değerleri
    const [animatedItems] = useState(() => 
        allChatRooms ? allChatRooms.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(20)
        })) : []
    );
    
    const buttonAnimatedStyle = {
        transform: [{ scale: buttonScale }]
    };

    // Buton basma animasyonu
    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
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

    function handleLogout() {
        setCurrentUser("");
        setShowLoginView(false);
        
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Homescreen' }],
            })
        );
    }

    // Sohbet listesini çeken fonksiyon
    const fetchConversations = useCallback(() => {
        if (!currentUser) return;
        // console.log("[Chatscreen] fetchConversations çağrıldı, kullanıcı:", currentUser);

        fetch(`${BaseUrl}/my-conversations?username=${currentUser}`)
            .then((res) => res.json())
            .then((data) => {
                // console.log("[Chatscreen] setAllChatRooms için /my-conversations'dan gelen veri:", data); 
                setAllChatRooms(data);
            })
            .catch((err) => console.error("[Chatscreen] Sohbet listesi alınamadı:", err));
    }, [currentUser, setAllChatRooms, BaseUrl]);

    // Ekran ilk yüklendiğinde ve focus olduğunda sohbet listesini çek
    useFocusEffect(
        useCallback(() => {
            // console.log("[Chatscreen] Ekran focus oldu, ilk sohbetler çekiliyor...");
            if (currentUser) { // currentUser varsa devam et
                fetchConversations();
                socket.emit("login", currentUser); // Kullanıcıyı socket'e login et
                console.log(`[Chatscreen] Socket: login event emitted for ${currentUser}`);
            }

            // `conversation_updated` olayını dinle
            const handleConversationUpdate = (updatedConversation) => {
                console.log("[Chatscreen] Socket: conversation_updated alındı:", updatedConversation);
                setAllChatRooms(prevChatRooms => {
                    const existingRoomIndex = prevChatRooms.findIndex(
                        room => room.conversation_id === updatedConversation.conversation_id
                    );
                    let newChatRooms;
                    if (existingRoomIndex !== -1) {
                        // Varolan sohbeti güncelle
                        newChatRooms = [...prevChatRooms];
                        newChatRooms[existingRoomIndex] = {
                            ...newChatRooms[existingRoomIndex], // Önceki bilgileri koru
                            last_message_text: updatedConversation.last_message_text,
                            last_message_image_url: updatedConversation.last_message_image_url,
                            last_message_sender_id: updatedConversation.last_message_sender_id,
                            last_message_timestamp: updatedConversation.last_message_timestamp,
                            // Partner bilgileri de güncellenebilir, backend'den geliyorsa
                            partner_username: updatedConversation.partner_username,
                            partner_profile_image_url: updatedConversation.partner_profile_image_url,
                        };
                    } else {
                        // Yeni bir sohbetse (nadiren olmalı, genelde fetchConversations halleder)
                        // Ancak backend'den gelen veri tam bir sohbet öğesi ise eklenebilir.
                        // Bu senaryo için backend'den gelen verinin Chatcomponent'in beklediği tüm alanları içerdiğinden emin olun.
                        console.log("[Chatscreen] Socket: Yeni bir sohbet öğesi olarak ekleniyor (beklenmedik olabilir).");
                        newChatRooms = [updatedConversation, ...prevChatRooms]; 
                    }
                    // Son mesaja göre sırala (en yeni en üstte)
                    return newChatRooms.sort((a, b) => 
                        new Date(b.last_message_timestamp) - new Date(a.last_message_timestamp)
                    );
                });
            };

            socket.on("conversation_updated", handleConversationUpdate);
            console.log("[Chatscreen] Socket: 'conversation_updated' dinleyicisi eklendi.");

            // Ekran blur olduğunda veya component unmount olduğunda dinleyiciyi kaldır
            return () => {
                console.log("[Chatscreen] Ekran blur/unmount, 'conversation_updated' dinleyicisi kaldırılıyor.");
                socket.off("conversation_updated", handleConversationUpdate);
            };
        }, [fetchConversations, setAllChatRooms, socket]) // socket'i dependency array'e ekledik
    );

    useEffect(() => {
        if (currentUser.trim() === "") navigation.navigate("Homescreen");
    }, [currentUser]);

    // Sayfa yüklendiğinde animasyonları başlat
    useEffect(() => {
        const animationTimeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(headerOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(listOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(listTranslateY, {
                    toValue: 0,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                })
            ]).start();
        }, 100);

        return () => clearTimeout(animationTimeout);
    }, []);
    
    // Chat listesi yüklendiğinde öğeleri animate et
    useEffect(() => {
        if (!allChatRooms || animatedItems.length === 0) return;
        
        // Yeni bir animatedItems dizisi oluştur
        const newAnimatedItems = allChatRooms.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(20)
        }));
        
        // Her öğe için animasyonu başlat
        newAnimatedItems.forEach((item, index) => {
            const delay = index * 100;
            Animated.parallel([
                Animated.timing(item.opacity, {
                    toValue: 1,
                    duration: 500,
                    delay,
                    useNativeDriver: true
                }),
                Animated.spring(item.translateY, {
                    toValue: 0,
                    friction: 7,
                    tension: 40,
                    delay,
                    useNativeDriver: true
                })
            ]).start();
        });
    }, [allChatRooms]);
    
    // Sohbete tıklama animasyonu
    const handleChatPress = (item) => {
        navigation.navigate("Messagescreen", {
            conversationId: item.conversation_id,
            partnerUsername: item.partner_username,
            partner_profile_image_url: item.partner_profile_image_url, 
        });
    };

    // Android geri tuşunu kontrol et - isteğe bağlı bir ek güvenlik önlemi olarak ekleyebiliriz
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (currentUser.trim() !== "") {
                return true;
            }
            return false;
        });

        return () => backHandler.remove();
    }, [currentUser]);

    // Sohbet listesi için render item fonksiyonu - Hook kullanılmıyor
    const renderChatItem = ({ item, index }) => {
        return (
            <Animated.View 
                style={{ 
                    opacity: 1,
                    transform: [{ translateY: 0 }]
                }}
            >
                <TouchableOpacity
                    onPress={() => handleChatPress(item)}
                    style={styles.chatItem}
                >
                    <Chatcomponent item={item} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.mainWrapper}>
            <Animated.View style={{ opacity: headerOpacity }}>
                <LinearGradient
                    colors={['#2E2F5B', '#1A1B47', '#070F2D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.topContainer}
                >
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            <TouchableOpacity onPress={() => navigation.navigate("Profilescreen")}>
                                <Ionicons name="person-circle-outline" size={30} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={styles.heading}>Merhaba, {currentUser}!</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={handleLogout} 
                            style={styles.logoutButton}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            <Animated.View style={[
                styles.listContainer, 
                { 
                    opacity: listOpacity,
                    transform: [{ translateY: listTranslateY }]
                }
            ]}>
                <Text style={styles.sectionTitle}>Son Görüşmeler</Text>
                
                {allChatRooms && allChatRooms.length > 0 ? (
                    <FlatList
                        data={allChatRooms}
                        renderItem={renderChatItem}
                        keyExtractor={(item) => item.conversation_id.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubble-ellipses-outline" size={60} color="#CCCCCC" />
                        <Text style={styles.emptyStateText}>
                            Henüz görüşme bulunmuyor.
                        </Text>
                    </View>
                )}
            </Animated.View>

            <View style={styles.bottomContainer}>
                <Animated.View style={buttonAnimatedStyle}>
                    <TouchableOpacity 
                        onPress={() => setModalVisible(true)} 
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        style={styles.button}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chatbubbles-outline" size={20} color="#FFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Yeni Sohbet Başlat</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {modalVisible && <NewGroupModal />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    topContainer: {
        height: 110,
        width: "100%",
        padding: 20,
        justifyContent: "flex-end",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginLeft: 10,
    },
    logoutButton: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2C2D5A",
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    listContainer: {
        flex: 1,
        backgroundColor: "#F5F7FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    chatItem: {
        marginVertical: 4,
        marginHorizontal: 15,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyStateText: {
        color: "#999999",
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
    },
    bottomContainer: {
        padding: 15,
        backgroundColor: "#F5F7FA",
    },
    button: {
        backgroundColor: "#5D5FEF",
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#5D5FEF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
