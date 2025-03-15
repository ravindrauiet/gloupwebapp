import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Link,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  SupportAgent as SupportIcon,
  KeyboardArrowRight as RightArrowIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getFeaturedProducts } from '../services/productService';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '70vh',
  maxHeight: 600,
  display: 'flex',
  alignItems: 'center',
  backgroundImage: 'url(https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
  }
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
}));

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await getFeaturedProducts();
        setFeaturedProducts(data || mockProducts); // Use mock data if API returns empty
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured products');
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      window.location.href = `/products?search=${searchQuery}`;
    }
  };

  // Mock product data
  const mockProducts = [
    {
      id: "prod1",
      title: "Vintage Denim Jacket",
      price: 89.99,
      category: "Clothing",
      condition: "Good",
      image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "prod2",
      title: "Nike Air Max Sneakers",
      price: 120.00,
      category: "Footwear",
      condition: "Like New",
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "prod3",
      title: "Leather Tote Bag",
      price: 75.50,
      category: "Bag",
      condition: "New",
      image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "prod4",
      title: "Cashmere Sweater",
      price: 65.00,
      category: "Clothing",
      condition: "Good",
      image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Categories data
  const categories = [
    {
      id: 'clothing',
      title: 'Clothing',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      count: 2450
    },
    {
      id: 'footwear',
      title: 'Footwear',
      image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      count: 1122
    },
    {
      id: 'accessories',
      title: 'Accessories',
      image: 'https://images.unsplash.com/photo-1547405370-8c45adc671b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      count: 890
    },
    {
      id: 'bags',
      title: 'Bags',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      count: 653
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Buy & Sell Pre-loved Fashion
              </Typography>
              
              <Typography variant="h5" sx={{ mb: 4, maxWidth: '80%' }}>
                Join our sustainable marketplace and give fashion a second life.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={RouterLink}
                  to="/products"
                  endIcon={<ArrowForwardIcon />}
                >
                  Shop Now
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                  component={RouterLink}
                  to="/product/new"
                >
                  Sell Your Items
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 2,
                  maxWidth: 400
                }}
              >
                <Typography variant="h6" color="text.primary" gutterBottom>
                  What are you looking for?
                </Typography>
                
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          component={RouterLink}
                          to={`/products?search=${searchQuery}`}
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label="Vintage" 
                    component={RouterLink}
                    to="/products?search=vintage"
                    clickable
                  />
                  <Chip 
                    label="Designer" 
                    component={RouterLink}
                    to="/products?search=designer"
                    clickable
                  />
                  <Chip 
                    label="Sustainable" 
                    component={RouterLink}
                    to="/products?search=sustainable"
                    clickable
                  />
                  <Chip 
                    label="Denim" 
                    component={RouterLink}
                    to="/products?search=denim"
                    clickable
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Browse Categories
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Find exactly what you're looking for in our curated collections
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {categories.map((category) => (
            <Grid item key={category.id} xs={6} md={3}>
              <CategoryCard>
                <CardActionArea component={RouterLink} to={`/products?category=${category.title}`}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.image}
                    alt={category.title}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count} items
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </CategoryCard>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            endIcon={<ArrowForwardIcon />}
            component={RouterLink}
            to="/products"
          >
            View All Categories
          </Button>
        </Box>
      </Container>

      {/* Featured Products Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" component="h2" gutterBottom>
                Featured Products
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Discover our handpicked selection of trending items
              </Typography>
            </Box>
            
            <Button 
              variant="text" 
              endIcon={<RightArrowIcon />}
              component={RouterLink}
              to="/products?featured=true"
            >
              View All
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">{error}</Typography>
          ) : (
            <Grid container spacing={3}>
              {featuredProducts.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea component={RouterLink} to={`/product/${product.id}`}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={product.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip 
                            label={product.condition} 
                            size="small" 
                            variant="outlined"
                          />
                          <Typography variant="subtitle1" color="primary" fontWeight="bold">
                            ${product.price.toFixed(2)}
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" component="div" noWrap>
                          {product.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          {product.category}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Features/Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Why Shop With Us
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Experience the benefits of our sustainable marketplace
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureBox>
              <TrendingIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Sustainable Fashion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Give clothes a second life and reduce environmental impact.
              </Typography>
            </FeatureBox>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureBox>
              <SecurityIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Secure Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shop with confidence with our secure payment system.
              </Typography>
            </FeatureBox>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureBox>
              <ShippingIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fast Shipping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get your items quickly with our reliable shipping partners.
              </Typography>
            </FeatureBox>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureBox>
              <SupportIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                24/7 Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our customer service team is always ready to help.
              </Typography>
            </FeatureBox>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to Clean Out Your Closet?
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3 }}>
                List your items in minutes and start selling to our community of fashion lovers.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                component={RouterLink}
                to="/product/new"
              >
                Start Selling
              </Button>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 2 }} />
                  <Typography>Easy listing process with AI assistance</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 2 }} />
                  <Typography>Set your own prices and shipping options</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 2 }} />
                  <Typography>Connect with buyers who appreciate your style</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Join Our Newsletter
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            Subscribe to stay updated on new arrivals, special offers, and sustainable fashion tips.
          </Typography>
          
          <Box 
            component="form" 
            sx={{ 
              display: 'flex', 
              maxWidth: 500, 
              mx: 'auto',
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <TextField
              fullWidth
              placeholder="Your email address"
              variant="outlined"
              size="medium"
              sx={{ 
                mr: { sm: 1 },
                mb: { xs: 2, sm: 0 }
              }}
            />
            <Button 
              variant="contained" 
              color="primary"
              endIcon={<SendIcon />}
              sx={{ 
                minWidth: { sm: 150 }
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 