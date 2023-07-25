import { Alert, Avatar, Box, Button, Container, Typography } from '@mui/material'
import React, { useState } from "react"
import { UserAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [error, setError] = useState("")
    const { user, logout } = UserAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        setError("")
    
        try {
          await logout()
          navigate("/login")
        } catch(error) {
          setError("Failed to log out!")
          console.log(error)  
        } 
      }
      const handleUpdate = () => {
          navigate("/update-profile")
      }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          boxShadow: 3,
          borderRadius: 3,
          px: 8,
          py: 8,
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Profile
        </Typography>
        <Avatar src={user?.photoURL}/>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ m: 1 }}/>
        <Typography component="h1" variant="h5">
          Email: {user.email}
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
        <Button
            onClick={handleUpdate}
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 1 }}
          >
            Update Profile
          </Button>  
          <Button
            onClick={handleLogout}
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Log Out
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Login