import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Rating,
  IconButton,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Breadcrumbs,
  ImageList,
  ImageListItem,
  Tab,
  Tabs
} from '@mui/material';
import {
  Favorite as HeartIcon,
  FavoriteBorder as HeartOutlineIcon,
  ShoppingCart as CartIcon,
  Share as ShareIcon,
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  CheckCircle as VerifiedIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../services/productService';

// Styled components
const ProductImage = styled('img')({
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
  maxHeight: '400px',
  borderRadius: '4px',
});

const ThumbnailImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  cursor: 'pointer',
  borderRadius: '4px',
  border: '2px solid transparent',
  '&:hover': {
    borderColor: '#3f51b5',
  },
});

export default function ProductDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      setNotificationMessage('Please login to save items to favorites');
      setNotificationOpen(true);
      return;
    }
    
    setFavorite(!favorite);
    setNotificationMessage(favorite ? 'Removed from favorites' : 'Added to favorites');
    setNotificationOpen(true);
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      setNotificationMessage('Please login to add items to cart');
      setNotificationOpen(true);
      return;
    }
    
    setNotificationMessage('Added to cart');
    setNotificationOpen(true);
    // Implement cart functionality here
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: `Check out this ${product?.title}`,
        url: window.location.href,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      setNotificationMessage('Link copied to clipboard');
      setNotificationOpen(true);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificationOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading product details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          component={Link} 
          to="/products" 
          startIcon={<BackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  // Placeholder data (would normally come from API)
  const mockProduct = {
    id: id,
    title: "Vintage Denim Jacket",
    price: 89.99,
    description: "Classic vintage denim jacket in excellent condition. Perfect for layering in all seasons. Features button-up front, two chest pockets, and adjustable waistband.",
    category: "Clothing",
    type: "Jacket",
    brand: "Levi's",
    condition: "Good",
    material: "Denim",
    color: "Blue",
    pattern: "Solid",
    style: "Vintage",
    gender: "Unisex",
    location: "Portland, OR",
    seller: {
      id: "seller123",
      name: "Vintage Finds",
      rating: 4.8,
      verified: true,
      joinDate: "2021-03-15"
    },
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["vintage", "denim", "jacket", "unisex", "90s"],
    shipping: "standard",
    createdAt: "2023-06-15T10:30:00Z",
    views: 243,
    favorites: 18
  };

  // Use mock data for now
  const productData = product || mockProduct;

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Home
        </Link>
        <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>
          Products
        </Link>
        <Link to={`/products/${productData.category.toLowerCase()}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {productData.category}
        </Link>
        <Typography color="text.primary">{productData.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left column - Images */}
        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 2 }}>
            <ProductImage
              src={productData.images[selectedImage]}
              alt={productData.title}
            />
          </Box>

          {/* Thumbnails */}
          <ImageList 
            cols={4} 
            rowHeight={100} 
            gap={8}
            sx={{ mt: 2, overflowX: 'auto' }}
          >
            {productData.images.map((image, index) => (
              <ImageListItem 
                key={index}
                onClick={() => setSelectedImage(index)}
                sx={{ 
                  cursor: 'pointer',
                  border: index === selectedImage ? '2px solid #3f51b5' : 'none',
                  borderRadius: '4px'
                }}
              >
                <ThumbnailImage
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>

        {/* Right column - Product details */}
        <Grid item xs={12} md={5}>
          <Typography variant="h4" component="h1" gutterBottom>
            {productData.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mr: 2 }}>
              ${productData.price.toFixed(2)}
            </Typography>
            
            <Chip 
              label={productData.condition} 
              color="secondary" 
              size="small" 
              variant="outlined"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Seller info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>
                Seller: {productData.seller.name}
              </Typography>
              {productData.seller.verified && (
                <VerifiedIcon color="primary" fontSize="small" />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating 
                value={productData.seller.rating} 
                precision={0.1} 
                size="small" 
                readOnly 
              />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                ({productData.seller.rating})
              </Typography>
            </Box>
          </Box>
          
          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">
              {productData.location}
            </Typography>
          </Box>
          
          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              size="large"
              startIcon={<CartIcon />}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            
            <IconButton 
              color={favorite ? "error" : "default"} 
              onClick={handleFavoriteToggle}
              sx={{ border: '1px solid #ddd' }}
            >
              {favorite ? <HeartIcon /> : <HeartOutlineIcon />}
            </IconButton>
            
            <IconButton 
              color="primary" 
              onClick={handleShare}
              sx={{ border: '1px solid #ddd' }}
            >
              <ShareIcon />
            </IconButton>
          </Box>
          
          {/* Product specs */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Product Specifications
            </Typography>
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Category:
                </Typography>
                <Typography variant="body2">
                  {productData.category}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Type:
                </Typography>
                <Typography variant="body2">
                  {productData.type}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Brand:
                </Typography>
                <Typography variant="body2">
                  {productData.brand}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Color:
                </Typography>
                <Typography variant="body2">
                  {productData.color}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Material:
                </Typography>
                <Typography variant="body2">
                  {productData.material}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Gender:
                </Typography>
                <Typography variant="body2">
                  {productData.gender}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Tags */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {productData.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  variant="outlined" 
                  onClick={() => {}} 
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Product details tabs */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="product details tabs"
          >
            <Tab label="Description" />
            <Tab label="Shipping" />
            <Tab label="Seller Info" />
          </Tabs>
        </Box>
        
        <Box sx={{ py: 3 }}>
          {tabValue === 0 && (
            <Typography variant="body1" paragraph>
              {productData.description}
            </Typography>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Typography variant="body1" paragraph>
                Shipping Method: {productData.shipping === 'free' ? 'Free Shipping' : 
                  productData.shipping === 'pickup' ? 'Local Pickup Only' : 
                  productData.shipping === 'calculated' ? 'Calculated by Buyer Location' : 
                  'Standard Shipping'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                Shipping from: {productData.location}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Delivery usually takes 3-5 business days depending on your location.
              </Typography>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {productData.seller.name} {productData.seller.verified && <VerifiedIcon color="primary" fontSize="small" />}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={productData.seller.rating} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({productData.seller.rating})
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                Member since: {new Date(productData.seller.joinDate).toLocaleDateString()}
              </Typography>
              
              <Button variant="outlined" size="small">
                View Seller's Profile
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Related products section would go here */}
      
      {/* Notification */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        message={notificationMessage}
      />
    </Container>
  );
} 