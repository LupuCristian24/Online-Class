import React, { createContext, useContext, useState, useEffect } from "react"
import { auth } from "../FireBase/Firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateEmail, updatePassword } from "firebase/auth"
import { GoogleAuthProvider, signInWithRedirect, sendPasswordResetEmail } from "firebase/auth";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    // signInWithPopup(auth, provider)
    signInWithRedirect(auth, provider)
  }

  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const signIn= (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    return signOut(auth)
  }

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  const newEmail= (email) => {
    return updateEmail(user, email)
  }

  const newPassword = (password) => {
    return updatePassword(user, password)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser)
      setLoading(false)
      // console.log('User', currentUser)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    createUser,
    googleSignIn,
    signIn,
    logout,
    resetPassword,
    newEmail,
    newPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
  
}

export const UserAuth = () => {
  return useContext(AuthContext)
}