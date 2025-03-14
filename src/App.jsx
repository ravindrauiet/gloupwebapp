import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ThriftProductsPage from './pages/ThriftProductsPage';
import ThriftSearch from './components/ThriftSearch.jsx';
import SellPage from './pages/SellPage';
import './App.css';

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

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Container maxWidth="lg">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/thrift-products" element={<ThriftProductsPage />} />
                <Route path="/thrift-search" element={<ThriftSearch />} />
                <Route path="/sell" element={<SellPage />} />
                {/* Add more routes as needed */}
              </Routes>
            </Container>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
