import React from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  Avatar,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserProfile() {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mb: 2 }}
                src={currentUser?.photoURL || ''}
                alt={currentUser?.displayName || 'User'}
              />
              <Typography variant="h5" gutterBottom>
                {currentUser?.displayName || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentUser?.email || 'user@example.com'}
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Edit Profile
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab label="Activity" />
                  <Tab label="Listings" />
                  <Tab label="Purchases" />
                </Tabs>
              </Box>
              
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your recent interactions will appear here.
                  </Typography>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Your Listings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">
                            Sample Product Listing
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Listed on: May 1, 2023
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small">View</Button>
                          <Button size="small" color="error">Remove</Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Purchase History
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your purchase history will appear here.
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 