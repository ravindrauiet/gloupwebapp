import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ThriftProductsList from '../components/thrift/ThriftProductsList';
import TextSearchComponent from '../components/thrift/TextSearchComponent';
import ImageSearchComponent from '../components/thrift/ImageSearchComponent';
import { getAllThriftProducts, searchThriftProducts, searchByImage } from '../services/geminiService';

const ThriftProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('text'); // 'text' or 'image'
  const [lastSearch, setLastSearch] = useState({
    type: 'initial', // 'initial', 'text', or 'image'
    params: null,
    imageFile: null
  });

  useEffect(() => {
    // Initial product fetch when page loads
    fetchAllThriftProducts();
  }, []);

  const fetchAllThriftProducts = async () => {
    setLoading(true);
    setError(null);
    setLastSearch({
      type: 'initial',
      params: null,
      imageFile: null
    });
    
    try {
      console.log('Fetching all thrift products...');
      const thriftProducts = await getAllThriftProducts();
      console.log('Fetched products:', thriftProducts);
      
      if (Array.isArray(thriftProducts) && thriftProducts.length > 0) {
        setProducts(thriftProducts);
      } else {
        console.warn('No products returned from API');
        // Use fallback products if the API returned an empty array
        setProducts([
          { id: 1, name: 'Vintage Denim Jacket', price: 25, location: 'Seattle, WA', condition: 'Good', imageUrl: 'https://i.imgur.com/IvQWvHp.jpg' },
          { id: 2, name: 'Retro Sunglasses', price: 15, location: 'Portland, OR', condition: 'Excellent', imageUrl: 'https://i.imgur.com/9qbQTUr.jpg' },
        ]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to fetch products: ${err.message || 'Unknown error'}`);
      setLoading(false);
      
      // If API fails, show some fallback products
      const fallbackProducts = [
        { id: 1, name: 'Vintage Denim Jacket', price: 25, location: 'Seattle, WA', condition: 'Good', imageUrl: 'https://i.imgur.com/IvQWvHp.jpg' },
        { id: 2, name: 'Retro Sunglasses', price: 15, location: 'Portland, OR', condition: 'Excellent', imageUrl: 'https://i.imgur.com/9qbQTUr.jpg' },
      ];
      setProducts(fallbackProducts);
    }
  };

  const handleTextSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setLastSearch({
      type: 'text',
      params: searchParams,
      imageFile: null
    });
    
    try {
      console.log('Performing text search with params:', searchParams);
      const searchResults = await searchThriftProducts(searchParams);
      console.log('Search results:', searchResults);
      
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        setProducts(searchResults);
      } else {
        console.warn('No results found for search');
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error during text search:', err);
      setError(`Search failed: ${err.message || 'Unknown error'}`);
      setLoading(false);
      
      // If API fails, show a fallback search result
      const fallbackResult = [
        { id: 1, name: 'Search result fallback', price: 25, location: searchParams.city || 'USA', condition: 'Good', imageUrl: 'https://i.imgur.com/YXaMOg6.jpg' },
      ];
      setProducts(fallbackResult);
    }
  };

  const handleImageSearch = async (imageFile) => {
    setLoading(true);
    setError(null);
    setLastSearch({
      type: 'image',
      params: null,
      imageFile: imageFile
    });
    
    try {
      console.log('Performing image search with file:', imageFile);
      const imageSearchResults = await searchByImage(imageFile);
      console.log('Image search results:', imageSearchResults);
      
      if (Array.isArray(imageSearchResults) && imageSearchResults.length > 0) {
        setProducts(imageSearchResults);
      } else {
        console.warn('No results found for image search');
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error during image search:', err);
      setError(`Image search failed: ${err.message || 'Unknown error'}`);
      setLoading(false);
      
      // If API fails, show fallback results
      const fallbackImageResults = [
        { id: 4, name: 'Similar item fallback', price: 30, location: 'New York, NY', condition: 'Like New', imageUrl: 'https://i.imgur.com/ZCBtpem.jpg' },
      ];
      setProducts(fallbackImageResults);
    }
  };

  const handleRetry = async () => {
    switch (lastSearch.type) {
      case 'initial':
        await fetchAllThriftProducts();
        break;
      case 'text':
        await handleTextSearch(lastSearch.params);
        break;
      case 'image':
        await handleImageSearch(lastSearch.imageFile);
        break;
      default:
        await fetchAllThriftProducts();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow px-4 py-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Thrift Product Explorer</h1>
          <p className="text-lg text-gray-600">Discover unique thrift products across the USA</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setSearchType('text')}
              className={`px-4 py-2 rounded-lg ${searchType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Text Search
            </button>
            <button
              onClick={() => setSearchType('image')}
              className={`px-4 py-2 rounded-lg ${searchType === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Image Search
            </button>
          </div>

          {searchType === 'text' ? (
            <TextSearchComponent onSearch={handleTextSearch} />
          ) : (
            <ImageSearchComponent onSearch={handleImageSearch} />
          )}
        </div>

        <ThriftProductsList 
          products={products} 
          loading={loading} 
          error={error} 
          onRetry={handleRetry}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ThriftProductsPage; 