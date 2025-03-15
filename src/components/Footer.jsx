import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Pinterest as PinterestIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              GLOUP
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              A sustainable marketplace for preloved fashion items. Buy and sell with confidence.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="primary">
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <PinterestIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Shop
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/products?category=Clothing" variant="body2" color="text.secondary">
                Clothing
              </Link>
              <Link component={RouterLink} to="/products?category=Footwear" variant="body2" color="text.secondary">
                Footwear
              </Link>
              <Link component={RouterLink} to="/products?category=Accessory" variant="body2" color="text.secondary">
                Accessories
              </Link>
              <Link component={RouterLink} to="/products?category=Bag" variant="body2" color="text.secondary">
                Bags
              </Link>
            </Stack>
          </Grid>

          {/* Account Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Account
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/login" variant="body2" color="text.secondary">
                Sign In
              </Link>
              <Link component={RouterLink} to="/register" variant="body2" color="text.secondary">
                Register
              </Link>
              <Link component={RouterLink} to="/profile" variant="body2" color="text.secondary">
                My Profile
              </Link>
              <Link component={RouterLink} to="/my-listings" variant="body2" color="text.secondary">
                My Listings
              </Link>
            </Stack>
          </Grid>

          {/* Help & Support */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Help
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/faq" variant="body2" color="text.secondary">
                FAQ
              </Link>
              <Link component={RouterLink} to="/shipping" variant="body2" color="text.secondary">
                Shipping
              </Link>
              <Link component={RouterLink} to="/returns" variant="body2" color="text.secondary">
                Returns
              </Link>
              <Link component={RouterLink} to="/contact" variant="body2" color="text.secondary">
                Contact Us
              </Link>
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={6} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  123 Fashion St, Style City, SC 12345
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  support@gloup.com
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 6, mb: 4 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            © {year} GLOUP. All rights reserved.
          </Typography>
          <Box>
            <Link href="#" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Privacy Policy
            </Link>
            <Link href="#" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Terms of Service
            </Link>
            <Link href="#" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 