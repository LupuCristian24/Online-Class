import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import React, { useState } from 'react'
import { useLocalContext } from '../../context/context'
import { UserAuth } from '../../context/AuthContext'
import { v4 as uuidV4 } from 'uuid'
import { db } from '../../FireBase/Firebase'
import { setDoc, doc } from "firebase/firestore" 

const CreateClass = () => {
    const { createClassDialog, setCreateClassDialog }= useLocalContext()
    const [className, setClassName] = useState('')
    const [subject, setSubject] = useState('')
    const [room, setRoom] = useState('')
    const { user } = UserAuth()

    const addNewClass= async (e) => {
      e.preventDefault()
      const id = uuidV4();
      const nameRef = doc(db, 'Created Classes', id)
      try {
        await setDoc(nameRef, {
          owner: user.email,
          className: className, 
          subject: subject,
          room: room,
          id: id,
        });
        setCreateClassDialog(false);
        setClassName('');
        setSubject('');
        setRoom('');
      } catch (error) {
        console.error("Error adding class document: ", error);
      }
    };

  return (
    <div>
      <Dialog 
        onClose={() => setCreateClassDialog(false)}
        aria-labelledby="customized-dialog-title"
        open={createClassDialog}
      >
      <DialogTitle>Create Class</DialogTitle>
        <DialogContent>
          <TextField 
          sx={{ m: 1, width: '73ch' }}
          id='outlined-basic' 
          label='Class Name (required)'  
          className='form_input' 
          variant='filled'
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          />
          <TextField 
          sx={{ m: 1, width: '73ch' }}
          id='filled-basic' 
          label='Subject'  
          className='form_input' 
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          />
          <TextField 
          sx={{ m: 1, width: '73ch' }}
          id="component-outlined"
          label='Room'  
          className='form_input' 
          variant="outlined"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateClassDialog(false)}>Cancel</Button>
          <Button onClick={addNewClass} disabled={!className}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateClass 