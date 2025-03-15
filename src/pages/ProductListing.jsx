import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProductListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      setError('Please fill out all required fields');
      return;
    }
    
    // In a real implementation, you would send this data to your API
    // and handle the response
    
    // Simulate successful submission
    setSuccess(true);
    setError('');
    
    // Redirect after a delay
    setTimeout(() => {
      navigate('/products');
    }, 2000);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          List a New Product
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Product submitted successfully! Redirecting...
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Product Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={success}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Price"
                name="price"
                type="number"
                InputProps={{ startAdornment: '$' }}
                value={formData.price}
                onChange={handleChange}
                disabled={success}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  disabled={success}
                >
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="home">Home & Garden</MenuItem>
                  <MenuItem value="sports">Sports & Outdoors</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="Condition"
                  disabled={success}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="like-new">Like New</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Product Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={success}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  border: '1px dashed #ccc', 
                  p: 3, 
                  textAlign: 'center',
                  borderRadius: 1
                }}
              >
                <Typography variant="body1" gutterBottom>
                  Drag & Drop Images Here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Or click to browse files (max 5 images)
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={success}
              >
                {success ? 'Submitted!' : 'List Product'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
} 