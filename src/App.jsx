import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThriftProductsPage from './pages/ThriftProductsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/thrift-products" element={<ThriftProductsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
