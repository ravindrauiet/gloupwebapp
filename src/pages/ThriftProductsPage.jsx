import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ThriftProductsList from '../components/thrift/ThriftProductsList';
import TextSearchComponent from '../components/thrift/TextSearchComponent';
import ImageSearchComponent from '../components/thrift/ImageSearchComponent';
import { searchThriftProducts, searchByImage } from '../services/geminiService.jsx';

// Simple test to directly check Gemini API connectivity
const testGeminiAPI = async () => {
  console.log('🧪 TESTING GEMINI API CONNECTIVITY...');
  try {
    const apiKey = 'AIzaSyDYGs1IsVCqJmd67IqE4ffnElmgA_fk_JI';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello, please respond with 'Gemini API is working!' and nothing else."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        }
      })
    });
    
    console.log('🧪 API test status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API TEST FAILED:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('🧪 API TEST RESPONSE:', data);
    
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('🧪 API TEST RESULT:', text);
      console.log('✅ GEMINI API CONNECTION SUCCESSFUL!');
      return true;
    } else {
      console.error('❌ API TEST FAILED: Unexpected response structure');
      return false;
    }
  } catch (error) {
    console.error('❌ API TEST FAILED:', error);
    return false;
  }
};

const ThriftProductsPage = () => {
  console.log('🔄 ThriftProductsPage component rendering');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('text'); // 'text' or 'image'
  const [lastSearch, setLastSearch] = useState({
    type: 'initial', // 'initial', 'text', or 'image'
    params: null,
    imageFile: null
  });
  const [apiStatus, setApiStatus] = useState('unknown'); // 'unknown', 'working', 'failed'

  useEffect(() => {
    console.log('🔄 ThriftProductsPage initial useEffect running');
    
    // Test the Gemini API
    testGeminiAPI().then(success => {
      setApiStatus(success ? 'working' : 'failed');
    });
    
    // Initial product fetch when page loads
    fetchAllThriftProducts();
  }, []);

  const fetchAllThriftProducts = async () => {
    console.log('🔍 Starting fetchAllThriftProducts');
    setLoading(true);
    setError(null);
    setLastSearch({
      type: 'initial',
      params: null,
      imageFile: null
    });
    
    try {
      console.log('📤 Fetching all thrift products...');
      // Use a specific query to get trending items with a higher limit
      const thriftProducts = await searchThriftProducts({
        query: 'trending vintage clothing items',
        limit: 24
      });
      console.log('📥 Fetched products count:', thriftProducts?.length);
      console.log('📥 Products data types:', thriftProducts ? typeof thriftProducts : 'null', 
                  Array.isArray(thriftProducts) ? 'is array' : 'not an array');
      console.log('📥 First product sample:', thriftProducts && thriftProducts.length > 0 ? JSON.stringify(thriftProducts[0], null, 2) : 'No products');
      
      if (Array.isArray(thriftProducts) && thriftProducts.length > 0) {
        console.log(`✅ Successfully set ${thriftProducts.length} products to state`);
        setProducts(thriftProducts);
      } else {
        console.warn('⚠️ No products returned from API');
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      console.error('❌ Error stack:', err.stack);
      setError(`Failed to fetch products: ${err.message || 'Unknown error'}`);
      setLoading(false);
      setProducts([]);
    }
  };

  const handleTextSearch = async (searchParams) => {
    console.log('🔍 Starting text search with params:', JSON.stringify(searchParams));
    setLoading(true);
    setError(null);
    setLastSearch({
      type: 'text',
      params: searchParams,
      imageFile: null
    });
    
    try {
      console.log('📤 Performing text search with Gemini API...');
      const searchResults = await searchThriftProducts(searchParams);
      console.log('📥 Text search results count:', searchResults?.length);
      console.log('📥 First result sample:', searchResults && searchResults.length > 0 ? JSON.stringify(searchResults[0], null, 2) : 'No results');
      
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        console.log(`✅ Successfully set ${searchResults.length} search results to state`);
        setProducts(searchResults);
      } else {
        console.warn('⚠️ No results found for search');
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Error during text search:', err);
      console.error('❌ Error stack:', err.stack);
      setError(`Search failed: ${err.message || 'Unknown error'}`);
      setLoading(false);
      setProducts([]);
    }
  };

  const handleImageSearch = async (imageFile) => {
    console.log('🖼️ Starting image search with file:', imageFile?.name);
    setLoading(true);
    setError(null);
    setLastSearch({
      type: 'image',
      params: null,
      imageFile: imageFile
    });
    
    try {
      console.log('📤 Performing image search with Gemini API...');
      // Extract the limit parameter if attached to the image object
      const limit = imageFile.limit || 24;
      const imageSearchResults = await searchByImage(imageFile, { limit });
      console.log('📥 Image search results count:', imageSearchResults?.length);
      console.log('📥 First result sample:', imageSearchResults && imageSearchResults.length > 0 ? 
                  JSON.stringify(imageSearchResults[0], null, 2) : 'No results');
      
      if (Array.isArray(imageSearchResults) && imageSearchResults.length > 0) {
        console.log(`✅ Successfully set ${imageSearchResults.length} image search results to state`);
        setProducts(imageSearchResults);
      } else {
        console.warn('⚠️ No results found for image search');
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Error during image search:', err);
      console.error('❌ Error stack:', err.stack);
      setError(`Image search failed: ${err.message || 'Unknown error'}`);
      setLoading(false);
      setProducts([]);
    }
  };

  const handleRetry = async () => {
    console.log('🔄 Retry attempt for last search type:', lastSearch.type);
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

  console.log('📊 Current state - Products count:', products.length, 
              'Loading:', loading, 'Error:', error ? 'Yes' : 'No',
              'Search type:', searchType);

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow px-4 py-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Thrift Product Explorer</h1>
          <p className="text-lg text-gray-600">Discover unique thrift products across the USA</p>
        </div>

        {apiStatus === 'failed' && (
          <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  API Connection Issue
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The Gemini API appears to be unavailable. The app will use mock data instead. 
                    This could be due to an invalid API key, network issues, or service limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => {
                console.log('🔘 Switching to text search');
                setSearchType('text');
              }}
              className={`px-4 py-2 rounded-lg ${searchType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Text Search
            </button>
            <button
              onClick={() => {
                console.log('🔘 Switching to image search');
                setSearchType('image');
              }}
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
      {/* <Footer /> */}
    </div>
  );
};

export default ThriftProductsPage; 