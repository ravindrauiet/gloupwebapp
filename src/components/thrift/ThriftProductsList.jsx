import PropTypes from 'prop-types';

const ThriftProductsList = ({ products, loading, error, onRetry }) => {
  console.log('🔄 ThriftProductsList rendering with', products?.length || 0, 'products');
  console.log('📊 Props state - Loading:', loading, 'Error:', error ? 'Yes' : 'No');
  
  if (products && products.length > 0) {
    console.log('📋 First product sample:', JSON.stringify(products[0], null, 2));
  }
  
  if (loading) {
    console.log('🔄 Showing loading state');
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Fetching thrift products...</p>
      </div>
    );
  }

  if (error) {
    console.log('❌ Showing error state:', error);
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative" role="alert">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <strong className="font-bold">Error!</strong>
        </div>
        <div className="mt-2">
          <span className="block sm:inline">{error}</span>
          <p className="mt-2 text-sm">This might be due to API limitations or network issues.</p>
        </div>
        {onRetry && (
          <div className="mt-4">
            <button 
              onClick={() => {
                console.log('🔄 Retry button clicked');
                onRetry();
              }}
              className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    console.log('ℹ️ Showing no products found state');
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 className="text-lg font-medium text-gray-700">No products found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search criteria or try a different search term</p>
      </div>
    );
  }

  console.log('✅ Rendering product grid with', products.length, 'products');
  
  // Check if we're displaying mock data or real Gemini data
  const isMockData = products.length > 0 && products[0].id.includes('MOCK_');
  console.log('🔍 Data source:', isMockData ? 'Using MOCK data' : 'Using REAL GEMINI data');
  
  return (
    <div>
      {/* Show source indicator at the top */}
      {products.length > 0 && (
        <div className={`mb-4 p-2 text-center rounded ${isMockData ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {isMockData ? 
            '⚠️ Currently showing mock data - Gemini API may be unavailable' : 
            '✅ Showing real data from Gemini API'}
        </div>
      )}
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          console.log(`📦 Rendering product: ${product.id} - ${product.name}`);
          
          // Determine if this is a mock product by checking the ID
          const isProductMock = product.id.includes('MOCK_');
          
          return (
            <div key={product.id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg ${isProductMock ? 'border border-yellow-300' : ''}`}>
              {isProductMock && (
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 text-center">
                  Mock Product
                </div>
              )}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    console.warn(`⚠️ Image load error for product ${product.id}:`, product.imageUrl);
                    e.target.onerror = null;
                    
                    // Try to extract Imgur ID if it's an Imgur URL and has error
                    if (product.imageUrl.includes('imgur.com')) {
                      const imgurMatch = product.imageUrl.match(/imgur\.com\/([A-Za-z0-9]{5,7})/);
                      console.warn(`⚠️ Failed Imgur ID: ${imgurMatch ? imgurMatch[1] : 'unknown'}`);
                    }
                    
                    // Use a nicer fallback with the product name
                    const encodedName = encodeURIComponent(product.name.replace(/\[MOCK\]\s+/g, ''));
                    e.target.src = `https://via.placeholder.com/400x300/f3f4f6/888888?text=${encodedName}`;
                    
                    // Add a small badge indicating image unavailable
                    const parent = e.target.parentNode;
                    if (parent && !parent.querySelector('.image-error-badge')) {
                      const badge = document.createElement('div');
                      badge.className = 'image-error-badge absolute top-0 right-0 bg-red-100 text-red-800 text-xs px-2 py-1 m-1 rounded';
                      badge.textContent = 'Image Unavailable';
                      parent.appendChild(badge);
                    }
                  }}
                  loading="lazy" // Add lazy loading for better performance
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-600 font-medium">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                  <span className="text-sm text-gray-500">{product.condition}</span>
                </div>
                <p className="text-gray-600 text-sm">{product.location}</p>
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ThriftProductsList.propTypes = {
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onRetry: PropTypes.func
};

export default ThriftProductsList; 