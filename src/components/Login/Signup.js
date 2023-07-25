import { Alert, Button, TextField, Link, Grid, Box, Typography, Container } from '@mui/material'
import React, { useEffect, useState } from "react"
import { UserAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { GoogleButton } from "react-google-button"


const Signup = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, confirmSetPassword] = useState('');

const { createUser, googleSignIn, user } = UserAuth()
const [error, setError] = useState("")
const [loading, setLoading] = useState(false)
const navigate = useNavigate()

const handleGoogleSignIn = async () => {
  try {
    await googleSignIn();
  }catch(error) {
    console.log(error)
  }
}

useEffect(() => {
  if(user != null) {
    navigate("/")
  }
},[user])

const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (password !== confirmPassword) {
    return setError("Passwords do not match!")
  }

  try {
    setError("")
    setLoading(true)
    await createUser(email, password);
    navigate("/")
  } catch(e) {
    setError("Failed to create an account!")
    console.log(e) 
  }

  setLoading(false)
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
          Sign Up
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          
          <TextField
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
          />
          <TextField
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
          />
          <TextField
            onChange={(e) => confirmSetPassword(e.target.value)}
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="Password"
            id="confirmPassword"
          />
          <Button
            disabled={loading}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
            
        </Box>
        <Grid item>
            <Link href="http://localhost:3000/login" variant="body2" align="center">
                {"Already have an account? Sign In"}
            </Link>
        </Grid>
        <Box sx={{ marginTop: '1rem', marginBottom: '1rem', display: "flex", alignItems: "center", justifyContent: "center", width: "65%" }}>
        <hr style={{ flex: "1", borderTop: "1px solid gray" }} />
        <Typography variant="body1" sx={{ px: 1 }}>
          Or
        </Typography>
        <hr style={{ flex: "1", borderTop: "1px solid gray" }} />
      </Box>
        {/* <GoogleButton type="light" onClick={handleGoogleSignIn} /> */}
        <GoogleButton onClick={handleGoogleSignIn} />
      </Box>
    </Container>
  );
};

export default Signup;