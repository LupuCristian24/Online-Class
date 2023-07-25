import React, { useState, useEffect } from "react";
import { Menu, Menu2, Login, Logout, Signup, ForgotPassword, UpdateProfile, JoinedClasses, Class, CreateQuiz, JoinQuiz, RealTimeResults } from "./components";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { UserAuth, AuthProvider } from "./context/AuthContext";
import PrivateRoutes from "./Routes/PrivateRoutes";
import { db } from './FireBase/Firebase'
import { doc, collection, onSnapshot } from 'firebase/firestore';
import "./App.css"

function App() {
  return (
      <AuthProvider>
        <Main/>
      </AuthProvider>
  )
}

function Main () {
  const { user } = UserAuth() 
  const [createdClasses, setCreatedClasses] = useState([])
  const [joinedClasses, setJoinedClasses] = useState([]);
  
  useEffect(() => {
    if (user) {
      // const createdClassesRef = collection(doc(db, "Created Classes", user), "Classes");
      const createdClassesRef = collection(db, "Created Classes");
      const unsubscribe = onSnapshot(createdClassesRef, (snapshot) => {
        setCreatedClasses(snapshot.docs.map((doc) => doc.data()));
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const joinedClassesRef = collection(doc(db, "Joined Classes", user.email), "Classes");
      const unsubscribe = onSnapshot(joinedClassesRef, (snapshot) => {
        setJoinedClasses(snapshot.docs.map((doc) => doc.data().joinedData));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const userCreatedClasses = createdClasses.filter(c => c.owner === user?.email);

  return (
    <Router>
        <Routes>
          {createdClasses.map((item, index) => (
            <Route key={index} exact path={`/${item.id}`} element={
              <PrivateRoutes>
                <Menu2 />
                <Class Data={item}/>
              </PrivateRoutes>
            } />
          ))}
          {joinedClasses.map((item, index) => (
            <Route key={index} exact path={`/${item.id}`} element={
              <PrivateRoutes>
                <Menu2 />
                <Class Data={item}/>
              </PrivateRoutes>
            } />
          ))}

          <Route exact path="/" element={
            <PrivateRoutes>
              <Menu />
              <div className="Container">
                {userCreatedClasses.map((item) => (
                  <div key={item.id}>
                    <JoinedClasses Class={item} />
                  </div>
                ))}
                {joinedClasses.map((item) => (
                  <div key={item.id}>
                    <JoinedClasses Class={item} />
                  </div>
                ))}
              </div>
              </PrivateRoutes>} />
          <Route path="/update-profile" element={<PrivateRoutes><UpdateProfile /></PrivateRoutes>} />
          <Route path="/logout" element={<PrivateRoutes><Logout /></PrivateRoutes>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-quiz" element={<PrivateRoutes><CreateQuiz /></PrivateRoutes>} />
          <Route path="/join-quiz/:quizId" element={<PrivateRoutes><JoinQuiz quizId /> </PrivateRoutes>} />
          <Route path="/results/:quizId" element={<PrivateRoutes><RealTimeResults /></PrivateRoutes>} />
        </Routes>
    </Router>
  );
}

export default App;