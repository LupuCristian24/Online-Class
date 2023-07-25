import { Alert, Box, Button, Container, Link, TextField, Typography } from '@mui/material';
import React, {useState} from 'react'
import { UserAuth } from '../../context/AuthContext'


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { resetPassword } = UserAuth()
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
      e.preventDefault()
  
      try {
        setMessage("")
        setError("")
        setLoading(true)
        await resetPassword(email)
        setMessage("Check your email for the reset link!")
      } catch(error){
        console.log(error) 
        setError("Failed to reset password!")
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
            py: 6,
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Password Reset
          </Typography>
          <Box sx={{ m: 1 }}/>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" textAlign='center' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
            />
            <Button
              disabled={loading}
              type="submit"
              variant="contained"
              sx={{ mt: 2.5 }}
            >
              Reset Password
            </Button>
          </Box>
          <Box sx={{ mt: 1.5 }}/>
          <Link href="http://localhost:3000/login" variant="body2" align="center">
                {"Go to Login"}
          </Link>
        </Box>
      </Container>
    );
}

export default ForgotPassword