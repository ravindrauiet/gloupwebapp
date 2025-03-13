import PropTypes from 'prop-types';

const ThriftProductsList = ({ products, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Fetching thrift products...</p>
      </div>
    );
  }

  if (error) {
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
              onClick={onRetry}
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
          <div className="h-48 overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150?text=Image+Unavailable';
              }}
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
      ))}
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