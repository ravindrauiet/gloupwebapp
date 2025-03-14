import { useState } from 'react';
import PropTypes from 'prop-types';

const TextSearchComponent = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    city: '',
    productType: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    limit: 24
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchParams({
      query: '',
      city: '',
      productType: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      limit: 24
    });
    onSearch({ limit: 24 });t
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Thrift Products</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Query */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              Search Keywords
            </label>
            <input
              type="text"
              id="query"
              name="query"
              value={searchParams.query}
              onChange={handleChange}
              placeholder="Vintage dress, leather jacket, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={searchParams.city}
              onChange={handleChange}
              placeholder="e.g. New York, Seattle"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Product Type */}
          <div>
            <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <select
              id="productType"
              name="productType"
              value={searchParams.productType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="shoes">Shoes</option>
              <option value="furniture">Furniture</option>
              <option value="electronics">Electronics</option>
              <option value="books">Books</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Condition */}
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={searchParams.condition}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          
          {/* Price Range */}
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Min Price ($)
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              min="0"
              value={searchParams.minPrice}
              onChange={handleChange}
              placeholder="Min $"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Max Price ($)
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              min="0"
              value={searchParams.maxPrice}
              onChange={handleChange}
              placeholder="Max $"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Number of Results */}
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Results
            </label>
            <select
              id="limit"
              name="limit"
              value={searchParams.limit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12">12 items</option>
              <option value="24">24 items</option>
              <option value="36">36 items</option>
              <option value="48">48 items</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

TextSearchComponent.propTypes = {
  onSearch: PropTypes.func.isRequired
};

export default TextSearchComponent; 