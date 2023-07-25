import { Alert, Button, TextField, Link, Grid, Box, Typography, Container } from '@mui/material'
import React, { useState } from "react"
import { UserAuth } from "../../context/AuthContext"
// import { useNavigate } from "react-router-dom"


const UpdateProfile = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, confirmSetPassword] = useState('');
const { user, newEmail, newPassword} = UserAuth()
const [error, setError] = useState("")
const [message, setMessage] = useState("")
const [loading, setLoading] = useState(false)
// const navigate = useNavigate()


const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (password !== confirmPassword) {
    return setError("Passwords do not match!")
  }

  const promises = []
  setLoading(true)
  setError("")
  setMessage("")
  console.log(user) 
  if (email !== user.email) {
    promises.push(newEmail(email))
  }
  if (password) {
    promises.push(newPassword(password))
  }

  Promise.all(promises)
    .then(() => {
    //   navigate("/")
    })
    .catch(() => {
      setError("Failed to update!")
    })
    .finally(() => {
      setMessage("Profile updated successfully!")
      setLoading(false)
    })
}

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          boxShadow: 3,
          borderRadius: 3,
          px: 8,
          py: 10,
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Update Profile
        </Typography>
        
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          
          <TextField
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            defaultValue={user.email}
          />
          <TextField
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            name="password"
            type="password"
            id="password"
            placeholder='Password (leave blank)'
          />
          <TextField
            onChange={(e) => confirmSetPassword(e.target.value)}
            margin="normal"
            fullWidth
            name="confirmPassword"
            type="Password"
            id="confirmPassword"
            placeholder='Confirm Password (leave blank)'
          />
          <Button
            disabled={loading}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Update
          </Button>
        </Box>
        <Grid item>
            <Link href="http://localhost:3000/" variant="body2" align="center">
                {"Cancel"}
            </Link>
        </Grid>
      </Box>
    </Container>
  );
};

export default UpdateProfile;