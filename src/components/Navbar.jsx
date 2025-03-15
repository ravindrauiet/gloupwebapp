import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  InputBase
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle,
  AddCircleOutline as SellIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

// Styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Logo = styled(Typography)({
  fontWeight: 700,
  letterSpacing: '.1rem',
  color: 'inherit',
  textDecoration: 'none',
});

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const userMenuOpen = Boolean(anchorEl);
  
  // Handle user menu
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Handle search
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      navigate(`/products?search=${event.target.value}`);
      event.target.value = '';
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    handleUserMenuClose();
    
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };
  
  // Drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2 }}>
        <Logo variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
          GLOUP
        </Logo>
      </Box>
      
      <Divider />
      
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        
        <ListItem button component={RouterLink} to="/products">
          <ListItemText primary="Products" />
        </ListItem>
      </List>
      
      <Divider />
      
      <List>
        {isAuthenticated ? (
          <>
            <ListItem button component={RouterLink} to="/product/new">
              <ListItemIcon>
                <SellIcon />
              </ListItemIcon>
              <ListItemText primary="Sell" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/favorites">
              <ListItemIcon>
                <FavoriteIcon />
              </ListItemIcon>
              <ListItemText primary="Favorites" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/cart">
              <ListItemIcon>
                <CartIcon />
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/profile">
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={RouterLink} to="/login">
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/register">
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Mobile hamburger menu */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Logo
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{ 
              mr: 2, 
              display: { xs: 'flex' }, 
              textDecoration: 'none',
              color: 'white'
            }}
          >
            GLOUP
          </Logo>
          
          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ color: 'white', my: 2, display: 'block' }}
            >
              Home
            </Button>
            
            <Button
              component={RouterLink}
              to="/products"
              sx={{ color: 'white', my: 2, display: 'block' }}
            >
              User Products
            </Button>

            <Button
              component={RouterLink}
              to="/thrift-search"
              sx={{ color: 'white', my: 2, display: 'block' }}
            >
              Thrift Search Products
            </Button>

            <Button
              component={RouterLink}
              to="/thrift-products"
              sx={{ color: 'white', my: 2, display: 'block' }}
            >
              Thrift Products
            </Button>
          </Box>
          
          {/* Search bar */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              onKeyPress={handleSearch}
            />
          </Search>
          
          {/* Right side buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <IconButton 
                  color="inherit" 
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                  component={RouterLink}
                  to="/product/new"
                >
                  <SellIcon />
                </IconButton>
                
                <IconButton 
                  color="inherit"
                  component={RouterLink}
                  to="/favorites"
                >
                  <FavoriteIcon />
                </IconButton>
                
                <IconButton 
                  color="inherit"
                  component={RouterLink}
                  to="/cart"
                >
                  <Badge badgeContent={0} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
                
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  color="inherit"
                >
                  {currentUser?.photoURL ? (
                    <Avatar 
                      alt={currentUser.displayName || 'User'} 
                      src={currentUser.photoURL} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={userMenuOpen}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem 
                    onClick={() => {
                      handleUserMenuClose();
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={() => {
                      handleUserMenuClose();
                      navigate('/my-listings');
                    }}
                  >
                    My Listings
                  </MenuItem>
                  
                  <Divider />
                  
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
                
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
} 