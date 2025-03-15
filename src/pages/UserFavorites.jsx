import React from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import { Favorite, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function UserFavorites() {
  // Mock data - in a real application, you would fetch this from your backend
  const [favorites, setFavorites] = React.useState([
    {
      id: 1,
      title: 'Sample Product 1',
      price: 29.99,
      image: 'https://via.placeholder.com/200',
      category: 'Clothing'
    },
    {
      id: 2,
      title: 'Sample Product 2',
      price: 49.99,
      image: 'https://via.placeholder.com/200',
      category: 'Electronics'
    },
    {
      id: 3,
      title: 'Sample Product 3',
      price: 19.99,
      image: 'https://via.placeholder.com/200',
      category: 'Home & Garden'
    }
  ]);

  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Favorites
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You don't have any favorites yet
            </Typography>
            <Button 
              component={Link} 
              to="/products" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Browse Products
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image}
                    alt={item.title}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.category}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${item.price}
                    </Typography>
                  </CardContent>
                  <CardActions disableSpacing>
                    <Button 
                      component={Link} 
                      to={`/product/${item.id}`} 
                      size="small"
                    >
                      View Details
                    </Button>
                    <IconButton 
                      aria-label="remove from favorites"
                      color="error"
                      onClick={() => handleRemoveFavorite(item.id)}
                      sx={{ ml: 'auto' }}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
} 