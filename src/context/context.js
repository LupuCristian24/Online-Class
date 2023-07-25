import { createContext, useContext, useState } from "react";

const addContext = createContext();

export function useLocalContext(){
    return useContext(addContext)
}

export function ContextProvider({children}) {
    const [createClassDialog, setCreateClassDialog] = useState(false);
    const [joinClassDialog, setJoinClassDialog] = useState(false);

    const value = {
        createClassDialog, 
        setCreateClassDialog, 
        joinClassDialog, 
        setJoinClassDialog,
    };
    return (
        <addContext.Provider 
            value={value}>{children}
        </addContext.Provider>
    )
}