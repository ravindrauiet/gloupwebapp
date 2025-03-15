import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserSettings() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });
  
  const [success, setSuccess] = useState(false);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({
      ...notifications,
      [name]: checked
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, you would update the user profile
    setSuccess(true);
    
    // Hide success message after a delay
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Settings
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your settings have been saved successfully!
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Profile Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={profileData.displayName}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h6" gutterBottom>
            Address Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={profileData.address}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={profileData.city}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={profileData.state}
                onChange={handleProfileChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip"
                value={profileData.zip}
                onChange={handleProfileChange}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email}
                    onChange={handleNotificationChange}
                    name="email"
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push}
                    onChange={handleNotificationChange}
                    name="push"
                  />
                }
                label="Push Notifications"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.marketing}
                    onChange={handleNotificationChange}
                    name="marketing"
                  />
                }
                label="Marketing Communications"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" color="primary" type="submit">
              Save Changes
            </Button>
            
            <Button variant="outlined" color="error">
              Delete Account
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 