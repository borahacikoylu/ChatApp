import { createContext } from "react";
import { useState } from "react";
import React, { useContext } from 'react';


export const GlobalContext = createContext(null);


function GlobalState({ children }) {
    const [showLoginView, setshowLoginView] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('');
    const [currentUser, setCurrentUser] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    return (
        <GlobalContext.Provider value={{ showLoginView, setshowLoginView, currentUserName, setCurrentUserName, currentUser, setCurrentUser, allUsers, setAllUsers }}>
            {children}
        </GlobalContext.Provider>
    );
}


export default GlobalState;