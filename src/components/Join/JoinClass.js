import { Close } from '@mui/icons-material';
import { Avatar, Button, Dialog, Slide, TextField } from '@mui/material';
import React, { useState, useEffect } from "react"
import { useLocalContext } from '../../context/context'
import { UserAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import { db } from '../../FireBase/Firebase'
import { setDoc, doc, getDoc } from "firebase/firestore"; 
import './JoinClass.css';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
  });
  
const JoinClass = () => {
    const{ joinClassDialog, setJoinClassDialog } = useLocalContext();
    const [error, setError] = useState(false)
    const { user, logout } = UserAuth()
    const [inviteCode, setInviteCode] = useState('')
    const [joinedData, setJoinedData] = useState(null)
    const [ifExists, setIfExists] = useState(false)
    const navigate = useNavigate()

    const resetState = () => {
      setError(false);
      setInviteCode('');
      setJoinedData(null);
      setIfExists(false);
    };

    const joiningClass = async (e) => {
      e.preventDefault()
      const docRef = doc(db, "Created Classes", inviteCode);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().owner !== user.email) {
          setIfExists(true);
          setJoinedData(docSnap.data());
          setError(false);
        } else {
          setError(true);
          setIfExists(false);
          return;
        }
      } catch (error) {
        console.error("Error joining class document: ", error);
      }
    }
    
  useEffect(() => {
    const joinClass = async () => {
      if (ifExists) {
        const joinedClassRef = doc(db, "Joined Classes", user.email, "Classes", inviteCode);
        await setDoc(joinedClassRef, { joinedData });
        setJoinClassDialog(false);
        resetState();
      }
    };
    joinClass();
  }, [ifExists]);

    const handleLogout = async () => {
      setError(false)
      try {
        await logout()
        navigate("/login")
      } catch(error) {
        setError("Failed to log out!")
        console.log(error)  
      } 
    }

  return (
    <div>
        <Dialog
            fullScreen
            open={joinClassDialog}
            onClose={() => {
              setJoinClassDialog(false);
              resetState();
            }}
            TransitionComponent={Transition}
        >
          <div className='JoinClass'>
            <div className='Wrapper1'>
              <div className='Wrapper2'>
                <Close className='SVG' onClick={() => setJoinClassDialog(false)}/>
                <div className='Title'>Join a Class</div>
              </div>
            </div>
            <div className='Form'>
              <p className='Text'>You are signed in as</p>
              <div className='Login_Info'>
                <div className='Class_Left'>
                  <Avatar src={user?.photoURL}/>
                  <div className='Login_Text'>
                    <div className='Login_Name'>{user?.displayName}</div>
                    <div className='Login_Email'>{user?.email}</div>
                  </div>
                </div>
                <Button variant='outlined' color='primary' onClick={handleLogout} >Logout</Button>
              </div>
            </div>
            <div className='Form'>
              <div style={{fontSize:'1.25rem', color:'#3c4043'}}
                className='Text'
              >
                Class Code
              </div>
              <div style={{color:'#3c4043', marginTop:'-5px'}}
                className='Text'
              >
                Enter the invite code
              </div>
              <div className='loginInfo'>
                <TextField
                id='outlined-basic'
                label='Class Code...'
                variant='outlined'
                // value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                error={error}
                helperText={error && "This class doesn't exist!"}
                />
                <Button
                  sx = {{marginLeft: '12.29rem'}}
                  className='Button'
                  variant='contained'
                  color='primary'
                  onClick={joiningClass}
                >
                  Join
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
    </div>
  );
};

export default JoinClass