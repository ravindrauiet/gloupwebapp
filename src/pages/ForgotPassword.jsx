import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { sendPasswordReset } from '../services/authService.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await sendPasswordReset(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Reset Password
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            Password reset email sent! Check your inbox for further instructions.
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleResetPassword} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleChange}
            disabled={loading || success}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
            disabled={loading || success}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Back to Sign In
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 