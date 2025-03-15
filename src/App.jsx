import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductListing from './components/ProductListing';
import HomePage from './pages/HomePage';
import ThriftProductsPage from './pages/ThriftProductsPage';
import ThriftSearch from './components/ThriftSearch.jsx';
import SellPage from './pages/SellPage';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import NotFound from './pages/NotFound';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
// import ProductListing from './pages/ProductListing';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings';
import UserFavorites from './pages/UserFavorites';
import './App.css';
import Home from './pages/Home.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <main className="flex-grow">
            <Container maxWidth="lg">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/thrift-products" element={<ThriftProductsPage />} />
                <Route path="/thrift-search" element={<ThriftSearch />} />
                <Route path="/sell" element={<SellPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route 
                  path="/product/new" 
                  element={
                    <ProtectedRoute>
                      <ProductListing />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <UserSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/favorites" 
                  element={
                    <ProtectedRoute>
                      <UserFavorites />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Container>
          </main>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
