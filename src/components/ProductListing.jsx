import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Typography, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  Alert,
  IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  ChevronLeft as BackIcon,
  ChevronRight as NextIcon,
  Check as VerifiedIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { analyzeProductImage, saveProductListing } from '../services/listingService';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImagePreview = styled('img')({
  width: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  marginTop: '16px',
  marginBottom: '16px',
  borderRadius: '4px',
});

// Steps for the form
const steps = [
  'Product Images',
  'Basic Details',
  'Characteristics',
  'Pricing & Shipping',
  'Review & Submit'
];

// Define form fields for validation
const allFields = {
  // Step 1 - Images
  imageFile: { required: true, label: 'Product Image', error: 'At least one image is required' },
  
  // Step 2 - Basic Details
  title: { required: true, label: 'Product Title', error: 'Title is required' },
  description: { required: true, label: 'Description', error: 'Description is required' },
  category: { required: true, label: 'Category', error: 'Category is required' },
  type: { required: true, label: 'Type', error: 'Type is required' },
  
  // Step 3 - Characteristics
  brand: { required: false, label: 'Brand', error: '' },
  condition: { required: true, label: 'Condition', error: 'Condition is required' },
  material: { required: false, label: 'Material', error: '' },
  color: { required: true, label: 'Color', error: 'Color is required' },
  pattern: { required: false, label: 'Pattern', error: '' },
  style: { required: false, label: 'Style', error: '' },
  gender: { required: false, label: 'Gender', error: '' },
  
  // Step 4 - Pricing & Shipping
  price: { required: true, label: 'Price', error: 'Price is required' },
  location: { required: true, label: 'Location', error: 'Location is required' },
  shipping: { required: false, label: 'Shipping Options', error: '' },
  
  // Hidden fields (populated by AI or system)
  tags: { required: false, label: 'Tags', error: '' },
};

// Initial form state
const initialFormData = {
  title: '',
  description: '',
  category: '',
  type: '',
  brand: '',
  condition: '',
  material: '',
  color: '',
  pattern: '',
  style: '',
  gender: '',
  price: '',
  location: '',
  shipping: 'standard',
  tags: [],
  imageUrls: [], // For storing temporary image URLs
  imageFiles: [], // For storing actual files to be uploaded
  ipAddress: '',
  gpsCoordinates: {
    latitude: '',
    longitude: ''
  }
};

/**
 * ProductListing Component
 * A multi-step form for users to list products on the platform
 */
export default function ProductListing() {
  // State for form data
  const [formData, setFormData] = useState({ ...initialFormData });
  
  // State for tracking form completion
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // State for AI analysis
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState({
    loading: false,
    complete: false,
    error: null,
    result: null
  });
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({ success: false, error: null });
  
  // State for location permissions
  const [locationPermission, setLocationPermission] = useState({
    granted: false,
    loading: false,
    error: null
  });

  // Fetch IP address on component mount
  useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          ipAddress: data.ip
        }));
      } catch (error) {
        console.error("Could not fetch IP address:", error);
      }
    };

    fetchIPAddress();
  }, []);

  // Function to request user's geolocation
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission({
        granted: false,
        loading: false,
        error: "Geolocation is not supported by your browser"
      });
      return;
    }

    setLocationPermission({
      ...locationPermission,
      loading: true
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          gpsCoordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));

        setLocationPermission({
          granted: true,
          loading: false,
          error: null
        });
      },
      (error) => {
        setLocationPermission({
          granted: false,
          loading: false,
          error: `Error getting location: ${error.message}`
        });
      }
    );
  };
  
  // Calculate completion percentage for progress indicator
  const calculateCompletion = () => {
    const fieldsByStep = [
      ['imageFile'], // Step 1
      ['title', 'description', 'category', 'type'], // Step 2
      ['condition', 'color'], // Step 3 (only required fields)
      ['price', 'location'], // Step 4
    ];
    
    const currentStepFields = fieldsByStep.slice(0, activeStep + 1).flat();
    const requiredFields = currentStepFields.filter(field => allFields[field]?.required);
    const completedFields = requiredFields.filter(field => {
      // Special case for image
      if (field === 'imageFile') return uploadedFiles.length > 0;
      // Regular fields
      return formData[field] && formData[field].trim !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100) || 0;
  };
  
  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is filled
    if (errors[name] && value.trim() !== '') {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // For now, we'll only handle a single file
    const file = files[0];
    
    // Create a temporary URL for preview
    const imageUrl = URL.createObjectURL(file);
    
    setUploadedFiles([...uploadedFiles, file]);
    setImagePreview(imageUrl);
    
    // Clear image error if it exists
    if (errors.imageFile) {
      setErrors({
        ...errors,
        imageFile: null
      });
    }
  };
  
  // Handle AI analysis
  const handleAnalyzeImage = async () => {
    if (uploadedFiles.length === 0) return;
    
    setAnalyzeStatus({
      loading: true,
      complete: false,
      error: null,
      result: null
    });
    
    setShowAnalysisDialog(true);
    
    try {
      // Send the first image for analysis
      const result = await analyzeProductImage(uploadedFiles[0]);
      
      setAnalyzeStatus({
        loading: false,
        complete: true,
        error: null,
        result: result
      });
      
    } catch (error) {
      setAnalyzeStatus({
        loading: false,
        complete: true,
        error: error.message,
        result: null
      });
    }
  };
  
  // Apply AI results to form
  const applyAnalysisResults = () => {
    const result = analyzeStatus.result;
    if (!result) return;
    
    // Map the analysis results to form fields
    setFormData({
      ...formData,
      title: formData.title || `${result.brand !== 'Unknown' ? result.brand + ' ' : ''}${result.type}`,
      description: formData.description || result.description,
      category: formData.category || result.category,
      type: formData.type || result.type,
      brand: formData.brand || (result.brand !== 'Unknown' ? result.brand : ''),
      condition: formData.condition || result.condition,
      material: formData.material || result.material,
      color: formData.color || (result.colors && result.colors.length > 0 ? result.colors[0] : ''),
      pattern: formData.pattern || result.pattern,
      style: formData.style || result.style,
      gender: formData.gender || result.gender,
      tags: formData.tags.length > 0 ? formData.tags : result.tags || []
    });
    
    setShowAnalysisDialog(false);
  };
  
  // Validate the current step
  const validateStep = (step) => {
    const fieldsByStep = [
      ['imageFile'], // Step 1
      ['title', 'description', 'category', 'type'], // Step 2
      ['condition', 'color'], // Step 3 (only required fields)
      ['price', 'location'], // Step 4
    ];
    
    const currentStepFields = fieldsByStep[step] || [];
    const newErrors = {};
    
    currentStepFields.forEach(field => {
      if (allFields[field]?.required) {
        // Special case for image
        if (field === 'imageFile') {
          if (uploadedFiles.length === 0) {
            newErrors[field] = allFields[field].error;
          }
        } 
        // Regular fields
        else if (!formData[field] || formData[field].trim?.() === '') {
          newErrors[field] = allFields[field].error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    const isValid = validateStep(activeStep);
    if (!isValid) return;
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Create a FormData object to handle file uploads
      const productData = {
        ...formData,
        // Format price as a number
        price: parseFloat(formData.price),
      };
      
      // In a real app, you would upload images to cloud storage 
      // and store their URLs instead of keeping them in memory
      
      const savedProduct = await saveProductListing(productData);
      
      setSubmitResult({
        success: true,
        error: null,
        product: savedProduct
      });
      
    } catch (error) {
      setSubmitResult({
        success: false,
        error: error.message,
        product: null
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle reset form
  const handleReset = () => {
    setFormData({ ...initialFormData });
    setUploadedFiles([]);
    setImagePreview(null);
    setErrors({});
    setActiveStep(0);
    setSubmitResult({ success: false, error: null });
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Product Images
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Add images of your product
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                    <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileUpload} />
                  </Button>
                  
                  {errors.imageFile && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                      {errors.imageFile}
                    </Alert>
                  )}
                  
                  {imagePreview && (
                    <Box sx={{ width: '100%', textAlign: 'center' }}>
                      <ImagePreview 
                        src={imagePreview} 
                        alt="Product preview" 
                      />
                      
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleAnalyzeImage}
                        startIcon={<PhotoCameraIcon />}
                        sx={{ mt: 2 }}
                      >
                        Analyze with AI
                      </Button>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Let AI analyze your image to automatically fill product details
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="title"
                  name="title"
                  label="Product Title"
                  fullWidth
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title || 'Enter a descriptive title for your product'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    <MenuItem value="Clothing">Clothing</MenuItem>
                    <MenuItem value="Footwear">Footwear</MenuItem>
                    <MenuItem value="Accessory">Accessories</MenuItem>
                    <MenuItem value="Bag">Bags</MenuItem>
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.type}>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    name="type"
                    value={formData.type}
                    label="Type"
                    onChange={handleChange}
                  >
                    {formData.category === 'Clothing' && [
                      <MenuItem key="tshirt" value="T-shirt">T-shirt</MenuItem>,
                      <MenuItem key="shirt" value="Shirt">Shirt</MenuItem>,
                      <MenuItem key="dress" value="Dress">Dress</MenuItem>,
                      <MenuItem key="pants" value="Pants">Pants</MenuItem>,
                      <MenuItem key="jeans" value="Jeans">Jeans</MenuItem>,
                      <MenuItem key="skirt" value="Skirt">Skirt</MenuItem>,
                      <MenuItem key="jacket" value="Jacket">Jacket</MenuItem>,
                      <MenuItem key="sweater" value="Sweater">Sweater</MenuItem>,
                      <MenuItem key="hoodie" value="Hoodie">Hoodie</MenuItem>,
                      <MenuItem key="coat" value="Coat">Coat</MenuItem>,
                    ]}
                    
                    {formData.category === 'Footwear' && [
                      <MenuItem key="sneakers" value="Sneakers">Sneakers</MenuItem>,
                      <MenuItem key="boots" value="Boots">Boots</MenuItem>,
                      <MenuItem key="sandals" value="Sandals">Sandals</MenuItem>,
                      <MenuItem key="heels" value="Heels">Heels</MenuItem>,
                      <MenuItem key="flats" value="Flats">Flats</MenuItem>,
                      <MenuItem key="loafers" value="Loafers">Loafers</MenuItem>,
                    ]}
                    
                    {formData.category === 'Accessory' && [
                      <MenuItem key="watch" value="Watch">Watch</MenuItem>,
                      <MenuItem key="jewelry" value="Jewelry">Jewelry</MenuItem>,
                      <MenuItem key="hat" value="Hat">Hat</MenuItem>,
                      <MenuItem key="belt" value="Belt">Belt</MenuItem>,
                      <MenuItem key="scarf" value="Scarf">Scarf</MenuItem>,
                      <MenuItem key="sunglasses" value="Sunglasses">Sunglasses</MenuItem>,
                      <MenuItem key="gloves" value="Gloves">Gloves</MenuItem>,
                    ]}
                    
                    {formData.category === 'Bag' && [
                      <MenuItem key="handbag" value="Handbag">Handbag</MenuItem>,
                      <MenuItem key="backpack" value="Backpack">Backpack</MenuItem>,
                      <MenuItem key="tote" value="Tote">Tote</MenuItem>,
                      <MenuItem key="purse" value="Purse">Purse</MenuItem>,
                      <MenuItem key="wallet" value="Wallet">Wallet</MenuItem>,
                    ]}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  id="description"
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description || 'Describe your product in detail'}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Characteristics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="brand"
                  name="brand"
                  label="Brand"
                  fullWidth
                  value={formData.brand}
                  onChange={handleChange}
                  error={!!errors.brand}
                  helperText={errors.brand}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.condition}>
                  <InputLabel id="condition-label">Condition</InputLabel>
                  <Select
                    labelId="condition-label"
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    label="Condition"
                    onChange={handleChange}
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Like New">Like New</MenuItem>
                    <MenuItem value="Good">Good</MenuItem>
                    <MenuItem value="Fair">Fair</MenuItem>
                  </Select>
                  {errors.condition && <FormHelperText>{errors.condition}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="color"
                  name="color"
                  label="Primary Color"
                  fullWidth
                  value={formData.color}
                  onChange={handleChange}
                  error={!!errors.color}
                  helperText={errors.color || 'Main color of the item'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="pattern-label">Pattern</InputLabel>
                  <Select
                    labelId="pattern-label"
                    id="pattern"
                    name="pattern"
                    value={formData.pattern}
                    label="Pattern"
                    onChange={handleChange}
                  >
                    <MenuItem value="Solid">Solid</MenuItem>
                    <MenuItem value="Striped">Striped</MenuItem>
                    <MenuItem value="Plaid">Plaid</MenuItem>
                    <MenuItem value="Floral">Floral</MenuItem>
                    <MenuItem value="Polka dot">Polka dot</MenuItem>
                    <MenuItem value="Checkered">Checkered</MenuItem>
                    <MenuItem value="Geometric">Geometric</MenuItem>
                    <MenuItem value="Abstract">Abstract</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="style-label">Style</InputLabel>
                  <Select
                    labelId="style-label"
                    id="style"
                    name="style"
                    value={formData.style}
                    label="Style"
                    onChange={handleChange}
                  >
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Formal">Formal</MenuItem>
                    <MenuItem value="Sporty">Sporty</MenuItem>
                    <MenuItem value="Vintage">Vintage</MenuItem>
                    <MenuItem value="Bohemian">Bohemian</MenuItem>
                    <MenuItem value="Minimalist">Minimalist</MenuItem>
                    <MenuItem value="Streetwear">Streetwear</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    label="Gender"
                    onChange={handleChange}
                  >
                    <MenuItem value="Men">Men</MenuItem>
                    <MenuItem value="Women">Women</MenuItem>
                    <MenuItem value="Unisex">Unisex</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  id="material"
                  name="material"
                  label="Material"
                  fullWidth
                  value={formData.material}
                  onChange={handleChange}
                  error={!!errors.material}
                  helperText={errors.material}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pricing & Shipping
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="price"
                  name="price"
                  label="Price ($)"
                  fullWidth
                  type="number"
                  inputProps={{ min: "0", step: "0.01" }}
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price || 'Set your price in USD'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="location"
                  name="location"
                  label="Location"
                  fullWidth
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location || 'City, State format (e.g. New York, NY)'}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="shipping-label">Shipping Options</InputLabel>
                  <Select
                    labelId="shipping-label"
                    id="shipping"
                    name="shipping"
                    value={formData.shipping}
                    label="Shipping Options"
                    onChange={handleChange}
                  >
                    <MenuItem value="standard">Standard Shipping</MenuItem>
                    <MenuItem value="free">Free Shipping</MenuItem>
                    <MenuItem value="pickup">Local Pickup Only</MenuItem>
                    <MenuItem value="calculated">Calculated by Buyer Location</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Location Data
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        id="ipAddress"
                        name="ipAddress"
                        label="IP Address"
                        fullWidth
                        value={formData.ipAddress}
                        InputProps={{
                          readOnly: true,
                        }}
                        helperText="Automatically detected"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        id="latitude"
                        label="GPS Latitude"
                        fullWidth
                        value={formData.gpsCoordinates.latitude}
                        InputProps={{
                          readOnly: true,
                        }}
                        disabled={!locationPermission.granted}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        id="longitude"
                        label="GPS Longitude"
                        fullWidth
                        value={formData.gpsCoordinates.longitude}
                        InputProps={{
                          readOnly: true,
                        }}
                        disabled={!locationPermission.granted}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={requestGeolocation}
                        disabled={locationPermission.loading || locationPermission.granted}
                        fullWidth
                        startIcon={locationPermission.loading && <CircularProgress size={20} />}
                      >
                        {locationPermission.loading 
                          ? 'Requesting Permission...' 
                          : locationPermission.granted 
                            ? 'Location Access Granted' 
                            : 'Share My Location'}
                      </Button>
                      
                      {locationPermission.error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {locationPermission.error}
                        </Alert>
                      )}
                      
                      {locationPermission.granted && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          Location successfully captured
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  {imagePreview && (
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={imagePreview}
                        alt={formData.title}
                        sx={{ objectFit: 'contain' }}
                      />
                    </Card>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{formData.title}</Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${parseFloat(formData.price).toFixed(2)}
                    </Typography>
                    
                    <Typography variant="subtitle1">
                      Condition: {formData.condition}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" paragraph>
                    {formData.description}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="textSecondary">Category:</Typography>
                      <Typography variant="body1">{formData.category}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="textSecondary">Type:</Typography>
                      <Typography variant="body1">{formData.type}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="textSecondary">Brand:</Typography>
                      <Typography variant="body1">{formData.brand || 'Not specified'}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="textSecondary">Color:</Typography>
                      <Typography variant="body1">{formData.color}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="textSecondary">Material:</Typography>
                      <Typography variant="body1">{formData.material || 'Not specified'}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="textSecondary">Location:</Typography>
                      <Typography variant="body1">{formData.location}</Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="textSecondary">
                      Location Information
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>IP Address:</strong> {formData.ipAddress || 'Not available'}
                      </Typography>
                      {locationPermission.granted && (
                        <Typography variant="body2">
                          <strong>GPS Coordinates:</strong> {formData.gpsCoordinates.latitude}, {formData.gpsCoordinates.longitude}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
            
            {submitResult.error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitResult.error}
              </Alert>
            )}
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  // Show success message after submission
  const renderSuccessScreen = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Your product has been listed successfully!
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <VerifiedIcon color="success" sx={{ fontSize: 60 }} />
      </Box>
      
      <Typography variant="body1" paragraph>
        Your listing is now pending review and will be visible to buyers soon.
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleReset}
          sx={{ mr: 2 }}
        >
          List Another Product
        </Button>
        
        {/* You can add a button to view the listing here */}
        <Button variant="outlined">
          View My Listings
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          List Your Product
        </Typography>
        
        {submitResult.success ? (
          renderSuccessScreen()
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={calculateCompletion()}
                sx={{ height: 8, borderRadius: 5 }}
              />
              <Typography variant="body2" color="textSecondary" align="right" sx={{ mt: 1 }}>
                {calculateCompletion()}% Complete
              </Typography>
            </Box>
            
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<BackIcon />}
              >
                Back
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={24} /> : <SaveIcon />}
                  >
                    {submitting ? 'Submitting...' : 'List Product'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<NextIcon />}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </>
        )}
      </Paper>
      
      {/* AI Analysis Dialog */}
      <Dialog
        open={showAnalysisDialog}
        onClose={() => !analyzeStatus.loading && setShowAnalysisDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          AI Product Analysis
          <IconButton
            aria-label="close"
            onClick={() => !analyzeStatus.loading && setShowAnalysisDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            disabled={analyzeStatus.loading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {analyzeStatus.loading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Analyzing your product image...
              </Typography>
            </Box>
          ) : analyzeStatus.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {analyzeStatus.error}
            </Alert>
          ) : analyzeStatus.result ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Analysis complete! Review the detected attributes below.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Product"
                      style={{ width: '100%', borderRadius: '4px' }}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6" gutterBottom>
                    Detected Attributes
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Category:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.category}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Type:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.type}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Colors:</Typography>
                      <Typography variant="body1">
                        {analyzeStatus.result.colors?.join(', ')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Material:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.material}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Condition:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.condition}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Brand:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.brand}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Style:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.style}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Pattern:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.pattern}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Gender:</Typography>
                      <Typography variant="body1">{analyzeStatus.result.gender}</Typography>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="textSecondary">Description:</Typography>
                    <Typography variant="body1" paragraph>
                      {analyzeStatus.result.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {analyzeStatus.result.tags?.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography variant="body1">
              No analysis results available.
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setShowAnalysisDialog(false)} 
            disabled={analyzeStatus.loading}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={applyAnalysisResults} 
            variant="contained" 
            color="primary"
            disabled={analyzeStatus.loading || !analyzeStatus.result}
          >
            Apply to Form
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 