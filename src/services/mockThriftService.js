import { mockThriftProducts } from './mockThriftProducts';

export const getAllThriftProducts = () => {
  console.log(`Getting all ${mockThriftProducts.length} thrift products`);
  return Promise.resolve(mockThriftProducts);
};

export const searchThriftProducts = (searchParams = {}) => {
  console.log('Searching with params:', JSON.stringify(searchParams));
  
  let filteredProducts = [...mockThriftProducts];
  console.log(`Starting with ${filteredProducts.length} products`);

  // Apply filters based on search parameters
  if (searchParams.query && searchParams.query.trim()) {
    const searchQuery = searchParams.query.toLowerCase().trim();
    console.log(`Filtering by query: "${searchQuery}"`);
    
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchQuery))) ||
      product.category.toLowerCase().includes(searchQuery) ||
      (product.subCategory && product.subCategory.toLowerCase().includes(searchQuery)) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery))
    );
    console.log(`After query filter: ${filteredProducts.length} products remaining`);
  }

  // Filter by city
  if (searchParams.city && searchParams.city.trim()) {
    const cityQuery = searchParams.city.toLowerCase().trim();
    console.log(`Filtering by city: "${cityQuery}"`);
    
    filteredProducts = filteredProducts.filter(product => 
      product.location && product.location.toLowerCase().includes(cityQuery)
    );
    console.log(`After city filter: ${filteredProducts.length} products remaining`);
  }

  // Filter by product type (category)
  if (searchParams.productType && searchParams.productType.trim()) {
    const typeQuery = searchParams.productType.toLowerCase().trim();
    console.log(`Filtering by product type: "${typeQuery}"`);
    
    filteredProducts = filteredProducts.filter(product => 
      (product.category && product.category.toLowerCase().includes(typeQuery)) || 
      (product.subCategory && product.subCategory.toLowerCase().includes(typeQuery))
    );
    console.log(`After product type filter: ${filteredProducts.length} products remaining`);
  }

  // Filter by condition
  if (searchParams.condition && searchParams.condition.trim()) {
    const conditionQuery = searchParams.condition.toLowerCase().trim();
    console.log(`Filtering by condition: "${conditionQuery}"`);
    
    filteredProducts = filteredProducts.filter(product => 
      product.condition && product.condition.toLowerCase().includes(conditionQuery)
    );
    console.log(`After condition filter: ${filteredProducts.length} products remaining`);
  }

  // Filter by price range
  if (searchParams.minPrice && !isNaN(parseFloat(searchParams.minPrice))) {
    const minPrice = parseFloat(searchParams.minPrice);
    console.log(`Filtering by min price: ${minPrice}`);
    
    filteredProducts = filteredProducts.filter(product => 
      product.price >= minPrice
    );
    console.log(`After min price filter: ${filteredProducts.length} products remaining`);
  }

  if (searchParams.maxPrice && !isNaN(parseFloat(searchParams.maxPrice))) {
    const maxPrice = parseFloat(searchParams.maxPrice);
    console.log(`Filtering by max price: ${maxPrice}`);
    
    filteredProducts = filteredProducts.filter(product => 
      product.price <= maxPrice
    );
    console.log(`After max price filter: ${filteredProducts.length} products remaining`);
  }

  // Apply limit if provided
  let limitedProducts = filteredProducts;
  if (searchParams.limit && !isNaN(parseInt(searchParams.limit))) {
    const limit = parseInt(searchParams.limit);
    console.log(`Applying limit: ${limit}`);
    limitedProducts = filteredProducts.slice(0, limit);
    console.log(`After applying limit: ${limitedProducts.length} products returned`);
  }

  // Add a small delay to simulate API call (100-300ms)
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Returning ${limitedProducts.length} products for search query`);
      resolve(limitedProducts);
    }, Math.random() * 200 + 100);
  });
};

export const searchByImage = (imageFile) => {
  console.log(`Starting image search with file: ${imageFile.name || 'unnamed file'}`);
  
  // For mock purposes, return products that might be visually similar
  // In a real implementation, this would use image recognition
  const randomProducts = mockThriftProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);
  
  console.log(`Found ${randomProducts.length} similar products for image search`);
  
  // Add a small delay to simulate API call (500-1500ms)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(randomProducts);
    }, Math.random() * 1000 + 500);
  });
}; 