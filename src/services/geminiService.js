// Gemini API service

const API_KEY = 'AIzaSyDYGs1IsVCqJmd67IqE4ffnElmgA_fk_JI';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
// Using the newer gemini-1.5-flash-002 model for both text and image queries
const MODEL_NAME = 'gemini-1.5-flash-002';

/**
 * Search for thrift products based on text parameters
 * @param {Object} searchParams - Search parameters (query, city, etc.)
 * @returns {Promise<Array>} - Array of product objects
 */
export const searchThriftProducts = async (searchParams = {}) => {
  try {
    console.log('Starting text search with params:', searchParams);
    
    // Build the prompt for Gemini based on search parameters
    let prompt = 'Find realistic thrift products in the USA';
    
    if (searchParams.query) {
      prompt += ` matching "${searchParams.query}"`;
    }
    
    if (searchParams.city) {
      prompt += ` in ${searchParams.city}`;
    }
    
    if (searchParams.productType) {
      prompt += ` of type ${searchParams.productType}`;
    }
    
    if (searchParams.condition) {
      prompt += ` in ${searchParams.condition} condition`;
    }
    
    if (searchParams.minPrice && searchParams.maxPrice) {
      prompt += ` with price between $${searchParams.minPrice} and $${searchParams.maxPrice}`;
    } else if (searchParams.minPrice) {
      prompt += ` with price above $${searchParams.minPrice}`;
    } else if (searchParams.maxPrice) {
      prompt += ` with price below $${searchParams.maxPrice}`;
    }
    
    prompt += '. Include real product descriptions, accurate pricing, and locations. Use real image URLs for similar products when possible (prefer imgur.com links). Make sure each product has an id, name, price (numeric value), location (city, state format), condition, and imageUrl. Return results as JSON array with these properties.';
    
    console.log('Using prompt:', prompt);
    
    // Direct API call to Gemini
    const url = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
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
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    // Extract the generated content and parse the JSON
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);
    
    // Process the text to extract JSON data
    try {
      // Look for JSON array pattern in the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Ensure all products have the required fields and fix any inconsistencies
        const validProducts = parsedData.filter(product => 
          product.id && 
          product.name && 
          (typeof product.price === 'number' || !isNaN(parseFloat(product.price))) &&
          product.location && 
          product.condition && 
          product.imageUrl
        ).map(product => ({
          ...product,
          price: typeof product.price === 'number' ? product.price : parseFloat(product.price),
          // Ensure imageUrl is valid, replace with placeholder if not
          imageUrl: product.imageUrl && product.imageUrl.startsWith('http') 
            ? product.imageUrl 
            : 'https://i.imgur.com/IvQWvHp.jpg'
        }));
        
        return validProducts;
      }
      
      // If no JSON array found, try to look for individual product objects
      console.warn('No JSON array found, trying to extract individual objects');
      const objectMatches = generatedText.match(/\{[\s\S]*?\}/g);
      if (objectMatches && objectMatches.length > 0) {
        const products = [];
        
        for (let i = 0; i < objectMatches.length; i++) {
          try {
            const product = JSON.parse(objectMatches[i]);
            if (product.name && product.location && product.condition) {
              // Add missing fields or fix invalid ones
              products.push({
                id: product.id || (i + 1),
                name: product.name,
                price: typeof product.price === 'number' ? product.price : parseFloat(product.price?.toString().replace(/[^\d.]/g, '')) || 25,
                location: product.location,
                condition: product.condition,
                imageUrl: (product.imageUrl && product.imageUrl.startsWith('http')) ? product.imageUrl : 'https://i.imgur.com/IvQWvHp.jpg'
              });
            }
          } catch (e) {
            console.error('Error parsing individual product:', e);
          }
        }
        
        if (products.length > 0) {
          return products;
        }
      }
      
      // If we still couldn't extract valid products, return fallback
      console.error('Could not extract valid products from Gemini response, returning fallback products');
      return generateMockProductsBasedOnSearch(searchParams);
    } catch (jsonError) {
      console.error('Error parsing JSON from response', jsonError);
      return generateMockProductsBasedOnSearch(searchParams);
    }
  } catch (error) {
    console.error('Detailed error searching products:', error);
    return generateMockProductsBasedOnSearch(searchParams);
  }
};

/**
 * Search for similar thrift products based on an uploaded image
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<Array>} - Array of similar product objects
 */
export const searchByImage = async (imageFile) => {
  try {
    console.log('Starting image search with file:', imageFile.name, 'type:', imageFile.type, 'size:', imageFile.size);
    
    // Convert the image file to base64
    const base64Image = await fileToBase64(imageFile);
    console.log('Image converted to base64');
    
    // Create the prompt for image search
    const prompt = `Analyze this image and find real thrift products in the USA that are similar to this item. 
Focus on matching similar styles, colors, patterns, and types of clothing. 
For each product, provide:
1. A descriptive name
2. A realistic price in USD
3. A specific location (city, state)
4. Condition (New, Like New, Good, Fair, or Poor)
5. A real image URL for a similar product if possible (prefer imgur.com urls)

Return the results as a JSON array with objects containing id, name, price (number), location, condition, and imageUrl properties.`;
    
    const url = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
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
                text: prompt
              },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image.split(',')[1] // Remove the data URL prefix
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    // Extract the generated content and parse the JSON
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);
    
    // Process the text to extract JSON data
    try {
      // Look for JSON array pattern in the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Ensure all products have the required fields
        const validProducts = parsedData.filter(product => 
          product.id && 
          product.name && 
          (typeof product.price === 'number' || !isNaN(parseFloat(product.price))) &&
          product.location && 
          product.condition && 
          product.imageUrl
        ).map(product => ({
          ...product,
          price: typeof product.price === 'number' ? product.price : parseFloat(product.price),
          // Ensure imageUrl is valid, replace with placeholder if not
          imageUrl: product.imageUrl && product.imageUrl.startsWith('http') 
            ? product.imageUrl 
            : 'https://i.imgur.com/ZCBtpem.jpg'
        }));
        
        return validProducts;
      }
      
      // If no valid JSON found, try to create products from the text descriptions
      console.warn('No JSON array found, extracting from text');
      const items = generatedText.split(/^\d+\./gm).filter(item => item.trim().length > 0);
      
      if (items.length > 0) {
        const products = items.map((item, index) => {
          const lines = item.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          const nameMatch = item.match(/[^:]+/);
          
          // Basic extraction logic - not perfect but should work for well-formatted responses
          let name = nameMatch ? nameMatch[0].trim() : `Similar Item ${index + 1}`;
          let price = 25; // Default price
          let location = 'USA'; // Default location
          let condition = 'Good'; // Default condition
          let imageUrl = 'https://i.imgur.com/ZCBtpem.jpg'; // Default image
          
          // Try to extract these properties from the text
          for (const line of lines) {
            if (line.toLowerCase().includes('price') || line.includes('$')) {
              const priceMatch = line.match(/\$?(\d+(\.\d{1,2})?)/);
              if (priceMatch) price = parseFloat(priceMatch[1]);
            }
            
            if (line.toLowerCase().includes('location') || line.includes(',')) {
              const locationMatch = line.match(/location:?\s*([^,]+,\s*[A-Z]{2})/i);
              if (locationMatch) location = locationMatch[1].trim();
              else {
                const cityStateMatch = line.match(/([A-Za-z\s]+,\s*[A-Z]{2})/);
                if (cityStateMatch) location = cityStateMatch[1].trim();
              }
            }
            
            if (line.toLowerCase().includes('condition')) {
              const conditionMatch = line.match(/condition:?\s*([A-Za-z\s]+)/i);
              if (conditionMatch) condition = conditionMatch[1].trim();
            }
            
            if (line.toLowerCase().includes('url') || line.toLowerCase().includes('image') || line.includes('http')) {
              const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
              if (urlMatch) imageUrl = urlMatch[1];
            }
          }
          
          return {
            id: index + 101, // Start from 101 to differentiate from text search results
            name,
            price,
            location,
            condition,
            imageUrl
          };
        });
        
        return products;
      }
      
      console.error('Could not extract valid products from image search, using fallback');
      return generateMockProductsBasedOnImage(imageFile);
    } catch (jsonError) {
      console.error('Error parsing JSON from response:', jsonError);
      return generateMockProductsBasedOnImage(imageFile);
    }
  } catch (error) {
    console.error('Detailed error searching by image:', error);
    return generateMockProductsBasedOnImage(imageFile);
  }
};

/**
 * Convert a File object to a base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 data URL
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generate realistic mock products based on search parameters
 * @param {Object} searchParams - Search parameters
 * @returns {Array} - Array of product objects
 */
const generateMockProductsBasedOnSearch = (searchParams) => {
  console.log('Generating fallback mock products based on search:', searchParams);
  
  // Base set of products
  const products = [
    {
      id: 1,
      name: 'Vintage Levi\'s Denim Jacket',
      price: 45.99,
      location: 'Portland, OR',
      condition: 'Good',
      imageUrl: 'https://i.imgur.com/IvQWvHp.jpg',
    },
    {
      id: 2,
      name: 'Retro Floral Print Dress',
      price: 28.50,
      location: 'Seattle, WA',
      condition: 'Like New',
      imageUrl: 'https://i.imgur.com/9qbQTUr.jpg',
    },
    {
      id: 3,
      name: 'Leather Messenger Bag',
      price: 34.99,
      location: 'Austin, TX',
      condition: 'Excellent',
      imageUrl: 'https://i.imgur.com/wzSNCpV.jpg',
    },
    {
      id: 4,
      name: 'Vintage Band T-Shirt',
      price: 22.00,
      location: 'Los Angeles, CA',
      condition: 'Good',
      imageUrl: 'https://i.imgur.com/YXaMOg6.jpg',
    },
    {
      id: 5,
      name: 'High-Waisted Mom Jeans',
      price: 32.50,
      location: 'Chicago, IL',
      condition: 'Very Good',
      imageUrl: 'https://i.imgur.com/3BkNItU.jpg',
    },
    {
      id: 6,
      name: 'Vintage Wool Sweater',
      price: 24.99,
      location: 'Boston, MA',
      condition: 'Good',
      imageUrl: 'https://i.imgur.com/uJq0Kd3.jpg',
    },
    {
      id: 7,
      name: 'Classic Leather Boots',
      price: 65.00,
      location: 'Denver, CO',
      condition: 'Fair',
      imageUrl: 'https://i.imgur.com/w6JZ2Wd.jpg',
    },
    {
      id: 8,
      name: 'Vintage Designer Handbag',
      price: 89.99,
      location: 'New York, NY',
      condition: 'Good',
      imageUrl: 'https://i.imgur.com/Pj3gM5r.jpg',
    }
  ];
  
  // Filter products based on search parameters
  let filteredProducts = [...products];
  
  // Filter by city
  if (searchParams.city) {
    const cityLower = searchParams.city.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.location.toLowerCase().includes(cityLower)
    );
  }
  
  // Filter by product type
  if (searchParams.productType) {
    const typeLower = searchParams.productType.toLowerCase();
    const typeMap = {
      'clothing': ['jacket', 'dress', 't-shirt', 'jeans', 'sweater'],
      'accessories': ['bag', 'handbag', 'watch', 'jewelry', 'scarf'],
      'shoes': ['boots', 'sneakers', 'shoes', 'heels'],
      'furniture': ['chair', 'table', 'desk', 'sofa'],
      'electronics': ['radio', 'stereo', 'walkman', 'camera'],
      'books': ['book', 'novel', 'magazine']
    };
    
    const keywordsToMatch = typeMap[typeLower] || [typeLower];
    filteredProducts = filteredProducts.filter(product => 
      keywordsToMatch.some(keyword => 
        product.name.toLowerCase().includes(keyword)
      )
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
  
  // Filter by condition
  if (searchParams.condition) {
    const conditionLower = searchParams.condition.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.condition.toLowerCase().includes(conditionLower)
    );
  }
  
  // Filter by keyword query
  if (searchParams.query) {
    const queryLower = searchParams.query.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(queryLower) ||
      product.condition.toLowerCase().includes(queryLower) ||
      product.location.toLowerCase().includes(queryLower)
    );
  }
  
  // If we've filtered everything out, return at least 2 random products
  if (filteredProducts.length === 0) {
    return products.slice(0, 4);
  }
  
  return filteredProducts;
};

/**
 * Generate realistic mock products based on image
 * @param {File} imageFile - The uploaded image file
 * @returns {Array} - Array of product objects
 */
const generateMockProductsBasedOnImage = (imageFile) => {
  console.log('Generating fallback mock products based on image:', imageFile.name);
  
  // Products for image search results - different from the regular search products
  const imageProducts = [
    {
      id: 101,
      name: 'Similar Style Vintage Dress',
      price: 38.50,
      location: 'San Francisco, CA',
      condition: 'Excellent',
      imageUrl: 'https://i.imgur.com/ZCBtpem.jpg',
    },
    {
      id: 102,
      name: 'Matching Pattern Skirt',
      price: 24.99,
      location: 'Miami, FL',
      condition: 'Like New',
      imageUrl: 'https://i.imgur.com/KJjt9MG.jpg',
    },
    {
      id: 103,
      name: 'Complementary Blouse',
      price: 19.95,
      location: 'Nashville, TN',
      condition: 'Very Good',
      imageUrl: 'https://i.imgur.com/a2QPPOq.jpg',
    },
    {
      id: 104,
      name: 'Similar Color Sweater',
      price: 29.99,
      location: 'Philadelphia, PA',
      condition: 'Good',
      imageUrl: 'https://i.imgur.com/vWWKKBb.jpg',
    },
    {
      id: 105,
      name: 'Matching Style Jacket',
      price: 45.00,
      location: 'Atlanta, GA',
      condition: 'Good',
      imageUrl: 'https://i.imgur.com/GPb0TDk.jpg',
    }
  ];
  
  // Return 3-5 random products from the image products
  const numProducts = Math.floor(Math.random() * 3) + 3; // 3 to 5 products
  
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = imageProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imageProducts[i], imageProducts[j]] = [imageProducts[j], imageProducts[i]];
  }
  
  return imageProducts.slice(0, numProducts);
};

/**
 * Fetch all thrift products in the USA
 * @returns {Promise<Array>} - Array of product objects
 */
export const getAllThriftProducts = async () => {
  console.log('Getting all thrift products');
  return searchThriftProducts({
    query: 'popular thrift clothing items'
  });
}; 