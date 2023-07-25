import { Alert, Button, TextField, FormControlLabel, Checkbox, Link, Grid, Box, Typography, Container } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { UserAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import GoogleButton from 'react-google-button';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, user, googleSignIn } = UserAuth()
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
    try {
      setError("")
      setLoading(true)
      await signIn(email, password)
      navigate("/")
    } catch(error){
      console.log(error) 
      setError("There is something wrong, failed to log in!")
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
          Sign In
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
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            disabled={loading}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="http://localhost:3000/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="http://localhost:3000/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ marginTop: '1rem', marginBottom: '1rem', display: "flex", alignItems: "center", justifyContent: "center", width: "65%" }}>
        <hr style={{ flex: "1", borderTop: "1px solid gray" }} />
        <Typography variant="body1" sx={{ px: 1 }}>
          Or
        </Typography>
        <hr style={{ flex: "1", borderTop: "1px solid gray" }} />
      </Box>
        <GoogleButton onClick={handleGoogleSignIn} />
      </Box>
    </Container>
  );
};

export default Login;