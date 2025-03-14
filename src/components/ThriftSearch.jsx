import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  FormControlLabel,
  Checkbox,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  AttachMoney as PriceIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import { searchThriftProducts, searchByImage, getAllThriftProducts } from '../services/mockThriftService';
import { analyzeImageWithGemini, searchProductsByImageAttributes } from '../services/geminiService';

const ThriftSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    productType: '',
    condition: '',
    minPrice: 0,
    maxPrice: 1000,
    limit: 24
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageSearchError, setImageSearchError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [imageSearchStatus, setImageSearchStatus] = useState({
    step: null,
    message: '',
    complete: false,
    attributes: null,
    error: null
  });

  // Load initial products when component mounts
  useEffect(() => {
    const loadInitialProducts = async () => {
      console.log('Loading initial products...');
      setLoading(true);
      try {
        const products = await getAllThriftProducts();
        console.log(`Successfully loaded ${products.length} products`);
        setSearchResults(products);
        setSnackbar({
          open: true,
          message: `Loaded ${products.length} products`,
          severity: 'success'
        });
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
        setSnackbar({
          open: true,
          message: 'Error loading products: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, []);

  const handleSearch = async () => {
    console.log(`Starting search with query: "${searchQuery}" and filters:`, filters);
    
    // No need to show a warning for empty query when searching with filters
    if (!searchQuery.trim() && 
        !filters.city && 
        !filters.productType && 
        !filters.condition && 
        filters.minPrice === 0 && 
        filters.maxPrice === 1000) {
      console.log('Search canceled - no query or filters specified');
      setSnackbar({
        open: true,
        message: 'Please enter a search query or select filters',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchConfig = {
        query: searchQuery.trim(),
        ...filters
      };
      console.log('Executing search with config:', searchConfig);
      
      const results = await searchThriftProducts(searchConfig);
      console.log(`Search completed - found ${results.length} results`);
      
      setSearchResults(results);
      setSnackbar({
        open: true,
        message: results.length > 0 
          ? `Found ${results.length} results` 
          : 'No matching products found',
        severity: results.length > 0 ? 'success' : 'info'
      });
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
      setSnackbar({
        open: true,
        message: 'Error searching products: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Clear previous search results and status when uploading a new image
      setImageSearchResults([]);
      setImageSearchError(null);
      setImageSearchStatus({
        step: null,
        message: '',
        complete: false,
        attributes: null,
        error: null
      });
      
      // Set the new image
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setShowImageDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearch = async () => {
    if (!selectedImage) {
      console.log('Image search canceled - no image selected');
      return;
    }

    console.log(`Starting Gemini image search for file: ${selectedImage.name}`);
    setImageSearchLoading(true);
    setImageSearchError(null);
    
    try {
      // Step 1: Show AI analysis status to the user
      setImageSearchStatus({ 
        step: 'analyzing',
        message: 'Analyzing image with Gemini AI...',
        complete: false 
      });
      
      // Step 2: Use Gemini to analyze the image and extract attributes
      const extractedAttributes = await analyzeImageWithGemini(selectedImage);
      console.log('Image analysis complete, extracted attributes:', extractedAttributes);
      
      // Update status and show attributes
      setImageSearchStatus({ 
        step: 'searching',
        message: 'Finding matching products...',
        complete: false,
        attributes: extractedAttributes 
      });
      
      // Step 3: Search for products matching the extracted attributes
      const results = await searchProductsByImageAttributes(extractedAttributes);
      console.log(`Found ${results.length} products matching the image attributes`);
      
      // Update completed status
      setImageSearchStatus({ 
        step: 'complete',
        message: `Found ${results.length} matching products`,
        complete: true,
        attributes: extractedAttributes 
      });
      
      // Set results
      setImageSearchResults(results);
      
      setSnackbar({
        open: true,
        message: results.length > 0 
          ? `Found ${results.length} similar items` 
          : 'No similar items found',
        severity: results.length > 0 ? 'success' : 'info'
      });
    } catch (err) {
      console.error('Image search error:', err);
      setImageSearchError(err.message || 'Image search failed');
      setImageSearchStatus({ 
        step: 'error',
        message: 'Error analyzing image',
        complete: true,
        error: err.message 
      });
      setSnackbar({
        open: true,
        message: 'Error searching by image: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setImageSearchLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePriceChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  };

  const handleCloseImageDialog = () => {
    // Completely reset all image search related state
    setShowImageDialog(false);
    setSelectedImage(null);
    setImagePreview(null);
    setImageSearchResults([]);
    setImageSearchError(null);
    setImageSearchStatus({
      step: null,
      message: '',
      complete: false,
      attributes: null,
      error: null
    });
    setImageSearchLoading(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Thrift Search
      </Typography>

      {/* Enhanced Search Bar */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for thrift items by name, brand, description or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button
            variant="contained"
            sx={{ minWidth: '120px' }}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? "primary" : "inherit"}
          >
            Filters
          </Button>
        </Box>

        {/* Quick Filter Chips */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ pt: 0.5 }}>
            Quick Filters:
          </Typography>
          <Chip 
            label="Clothing" 
            variant="outlined" 
            onClick={() => {
              setFilters(prev => ({ ...prev, productType: 'Clothing' }));
              setShowFilters(true);
              handleSearch();
            }}
          />
          <Chip 
            label="Accessories" 
            variant="outlined" 
            onClick={() => {
              setFilters(prev => ({ ...prev, productType: 'Accessories' }));
              setShowFilters(true);
              handleSearch();
            }}
          />
          <Chip 
            label="Vintage" 
            variant="outlined" 
            onClick={() => {
              setFilters(prev => ({ ...prev, condition: 'vintage' }));
              setShowFilters(true);
              handleSearch();
            }}
          />
          <Chip 
            label="Under $50" 
            variant="outlined" 
            onClick={() => {
              setFilters(prev => ({ ...prev, maxPrice: 50 }));
              setShowFilters(true);
              handleSearch();
            }}
          />
          <Chip 
            label="New York" 
            variant="outlined" 
            onClick={() => {
              setFilters(prev => ({ ...prev, city: 'New York' }));
              setShowFilters(true);
              handleSearch();
            }}
          />
          <Chip 
            label="Clear All" 
            color="primary"
            onClick={() => {
              setFilters({
                city: '',
                productType: '',
                condition: '',
                minPrice: 0,
                maxPrice: 1000,
                limit: 24
              });
              setSearchQuery('');
              getAllThriftProducts().then(products => {
                setSearchResults(products);
              });
            }}
          />
        </Stack>
      </Box>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <Box sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Filters
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Location</InputLabel>
                <Select
                  value={filters.city}
                  onChange={handleFilterChange('city')}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="New York">New York</MenuItem>
                  <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                  <MenuItem value="Chicago">Chicago</MenuItem>
                  <MenuItem value="Miami">Miami</MenuItem>
                  <MenuItem value="Boston">Boston</MenuItem>
                  <MenuItem value="Etsy">Etsy</MenuItem>
                  <MenuItem value="eBay">eBay</MenuItem>
                  <MenuItem value="Thrift Vintage Fashion">Thrift Vintage Fashion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.productType}
                  onChange={handleFilterChange('productType')}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Accessories">Accessories</MenuItem>
                  <MenuItem value="Footwear">Footwear</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Condition</InputLabel>
                <Select
                  value={filters.condition}
                  onChange={handleFilterChange('condition')}
                  label="Condition"
                >
                  <MenuItem value="">All Conditions</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="pre-owned">Pre-owned</MenuItem>
                  <MenuItem value="vintage">Vintage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography id="price-slider" gutterBottom>
                Price Range: ${filters.minPrice} - ${filters.maxPrice}
              </Typography>
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                step={10}
                aria-labelledby="price-slider"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setFilters({
                      city: '',
                      productType: '',
                      condition: '',
                      minPrice: 0,
                      maxPrice: 1000,
                      limit: 24
                    });
                  }}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Image Search Button */}
      <Box sx={{ mb: 4 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload"
          type="file"
          onChange={handleImageUpload}
        />
        <label htmlFor="image-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<ImageIcon />}
            fullWidth
            sx={{ py: 1.5, bgcolor: '#f5f5f5' }}
          >
            Search by Image - Upload a photo to find similar thrift items
          </Button>
        </label>
      </Box>

      {/* Search Status and Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, mt: 0.5 }}>
            Searching for thrift items...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
            </Typography>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                label="Sort By"
                value="relevance"
                // Add sorting functionality if needed
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {searchResults.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" noWrap title={product.name}>
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CategoryIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.category}{product.subCategory ? ` / ${product.subCategory}` : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.condition}
                      </Typography>
                    </Box>
                    {product.brand && (
                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        <b>Brand:</b> {product.brand}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                      {product.tags && product.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                          onClick={() => {
                            setSearchQuery(tag);
                            handleSearch();
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {searchResults.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary">
                No matching thrift items found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search terms or filters
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Image Search Dialog */}
      <Dialog
        open={showImageDialog}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
            AI-Powered Image Search
            <IconButton
              aria-label="close"
              onClick={handleCloseImageDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Top Section: Image Preview and Search Button - Always Visible */}
          <Box sx={{ mb: 3 }}>
            {/* Image Preview */}
            {imagePreview && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Your uploaded image:
                </Typography>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            )}

            {/* Search Button - Always Visible Near Top */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Button
                variant="contained"
                onClick={handleImageSearch}
                disabled={imageSearchLoading || !selectedImage}
                startIcon={imageSearchLoading ? <CircularProgress size={20} /> : <AIIcon />}
                size="large"
                sx={{ minWidth: '250px', py: 1.2 }}
              >
                {imageSearchLoading ? 'Analyzing...' : 'Analyze with Gemini AI'}
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Middle Section: AI Analysis Status */}
          {imageSearchStatus.step && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {imageSearchStatus.step === 'analyzing' && 'AI Image Analysis'}
                {imageSearchStatus.step === 'searching' && 'Finding Similar Products'}
                {imageSearchStatus.step === 'complete' && 'Analysis Complete'}
                {imageSearchStatus.step === 'error' && 'Analysis Error'}
              </Typography>
              
              {!imageSearchStatus.complete && (
                <LinearProgress sx={{ mb: 2 }} />
              )}
              
              <Typography variant="body2" color="text.secondary">
                {imageSearchStatus.message}
              </Typography>
              
              {/* Display extracted attributes if available */}
              {imageSearchStatus.attributes && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Gemini AI detected the following:
                  </Typography>
                  <Grid container spacing={1}>
                    {imageSearchStatus.attributes.category && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <b>Category:</b> {imageSearchStatus.attributes.category}
                        </Typography>
                      </Grid>
                    )}
                    {imageSearchStatus.attributes.colors && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <b>Colors:</b> {imageSearchStatus.attributes.colors.join(', ')}
                        </Typography>
                      </Grid>
                    )}
                    {imageSearchStatus.attributes.style && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <b>Style:</b> {imageSearchStatus.attributes.style}
                        </Typography>
                      </Grid>
                    )}
                    {imageSearchStatus.attributes.condition && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <b>Condition:</b> {imageSearchStatus.attributes.condition}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
              
              {imageSearchStatus.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {imageSearchStatus.error}
                </Alert>
              )}
            </Box>
          )}
          
          {/* Show any errors not related to the analysis process */}
          {imageSearchError && !imageSearchStatus.error && (
            <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
              {imageSearchError}
            </Alert>
          )}
          
          {/* Bottom Section: Results (only shown after analysis) */}
          {imageSearchResults.length > 0 && imageSearchStatus.complete && (
            <>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Similar Products ({imageSearchResults.length})
              </Typography>
              <Grid container spacing={2}>
                {imageSearchResults.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.imageUrl}
                        alt={product.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {product.category}{product.subCategory ? ` / ${product.subCategory}` : ''}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Close</Button>
          {imageSearchResults.length > 0 && (
            <Button 
              onClick={() => {
                setSearchResults(imageSearchResults);
                handleCloseImageDialog();
                setSnackbar({
                  open: true,
                  message: `Showing ${imageSearchResults.length} products from image search`,
                  severity: 'success'
                });
              }} 
              color="primary"
              variant="contained"
            >
              Show Results in Main View
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ThriftSearch; 