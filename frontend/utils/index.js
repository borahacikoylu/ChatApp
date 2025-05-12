import { Platform } from "react-native";
import { io } from "socket.io-client";

// HTTP API istekleri için temel URL
export const BaseUrl =
    Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

// Socket.io bağlantısı (artık 3000 portundan yapılacak)
export const socket = io(
    Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000",
    {
        transports: ["websocket"], // bağlantıyı güçlendirir (opsiyonel ama tavsiye edilir)
    }
);
