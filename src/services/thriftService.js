// Thrift service for handling product data
import { thriftProducts } from './mockThriftProducts';

/**
 * Search for thrift products based on text parameters
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Array>} - Array of product objects
 */
export const searchThriftProducts = async (searchParams = {}) => {
  try {
    console.log('🔍 Starting text search with params:', JSON.stringify(searchParams));
    
    // Filter products based on search parameters
    let filteredProducts = [...thriftProducts];
    
    // Filter by query
    if (searchParams.query) {
      const queryLower = searchParams.query.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(queryLower) ||
        product.description.toLowerCase().includes(queryLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }
    
    // Filter by city/location
    if (searchParams.city) {
      const cityLower = searchParams.city.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.location.toLowerCase().includes(cityLower)
      );
    }
    
    // Filter by product type
    if (searchParams.productType) {
      const typeLower = searchParams.productType.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase().includes(typeLower) ||
        product.subCategory.toLowerCase().includes(typeLower)
      );
    }
    
    // Filter by condition
    if (searchParams.condition) {
      const conditionLower = searchParams.condition.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.condition.toLowerCase().includes(conditionLower)
      );
    }
    
    // Filter by price range
    if (searchParams.minPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= parseFloat(searchParams.minPrice)
      );
    }
    
    if (searchParams.maxPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= parseFloat(searchParams.maxPrice)
      );
    }
    
    // Limit results if specified
    if (searchParams.limit) {
      filteredProducts = filteredProducts.slice(0, searchParams.limit);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Returning ${filteredProducts.length} filtered products`);
    return filteredProducts;
    
  } catch (error) {
    console.error('❌ Error in searchThriftProducts:', error);
    throw error;
  }
};

/**
 * Search for similar thrift products based on an uploaded image
 * @param {File} imageFile - The image file to analyze
 * @param {Object} options - Additional options like limit
 * @returns {Promise<Array>} - Array of similar product objects
 */
export const searchByImage = async (imageFile, options = {}) => {
  try {
    console.log('🖼️ Starting image search with file:', imageFile.name);
    
    // For now, return random products that might be visually similar
    const limit = options.limit || 24;
    const shuffledProducts = [...thriftProducts]
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Returning ${shuffledProducts.length} image search results`);
    return shuffledProducts;
    
  } catch (error) {
    console.error('❌ Error in searchByImage:', error);
    throw error;
  }
};

/**
 * Get all thrift products
 * @returns {Promise<Array>} - Array of all product objects
 */
export const getAllThriftProducts = async () => {
  try {
    console.log('🔍 Getting all thrift products');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Returning ${thriftProducts.length} products`);
    return thriftProducts;
    
  } catch (error) {
    console.error('❌ Error in getAllThriftProducts:', error);
    throw error;
  }
}; 