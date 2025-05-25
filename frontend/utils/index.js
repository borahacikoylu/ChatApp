import { Platform } from "react-native";
import { io } from "socket.io-client";

// HTTP API istekleri için temel URL
export const BaseUrl =
    Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.102:3000";

// Socket.io bağlantısı
export const socket = io(
    Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.102:3000",
    {
        transports: ["websocket"],
    }
);

/*
import { Platform } from "react-native";
import { io } from "socket.io-client";

// Macbook'un IP'si (hotspot üzerinden aldığın IP)
const LOCAL_HOST_IP = "http://172.20.10.5:3000";

export const BaseUrl = LOCAL_HOST_IP;

export const socket = io(LOCAL_HOST_IP, {
    transports: ["websocket"],
});
*/