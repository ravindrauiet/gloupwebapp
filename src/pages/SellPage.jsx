import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ProductListing from '../components/ProductListing';

function SellPage() {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Sell Your Items
        </Typography>
        <Typography variant="subtitle1" paragraph textAlign="center" sx={{ mb: 4 }}>
          List your pre-loved clothing and accessories for others to discover
        </Typography>
        
        <ProductListing />
      </Container>
    </Box>
  );
}

export default SellPage; 