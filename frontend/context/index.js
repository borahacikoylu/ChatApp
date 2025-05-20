import { createContext, useState } from "react";

export const GlobalContext = createContext(null);

function GlobalState({ children }) {
    const [showLoginView, setShowLoginView] = useState(false);
    const [currentUserName, setCurrentUserName] = useState("");
    const [currentUser, setCurrentUser] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null); // ✅ eklendi
    const [allChatRooms, setAllChatRooms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [allChatMessages, setAllChatMessages] = useState([]);
    const [currentChatMesage, setCurrentChatMessage] = useState("");
    const [password, setPassword] = useState("");

    return (
        <GlobalContext.Provider
            value={{
                showLoginView,
                setShowLoginView,
                currentUserName,
                setCurrentUserName,
                currentUser,
                setCurrentUser,
                currentUserId,              // ✅ eklendi
                setCurrentUserId,           // ✅ eklendi
                allChatRooms,
                setAllChatRooms,
                modalVisible,
                setModalVisible,
                allChatMessages,
                setAllChatMessages,
                currentChatMesage,
                setCurrentChatMessage,
                password,
                setPassword,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
}

export default GlobalState;
