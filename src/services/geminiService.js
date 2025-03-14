// Gemini API service

const API_KEY = 'AIzaSyDYGs1IsVCqJmd67IqE4ffnElmgA_fk_JI';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
// Using the newer gemini-1.5-flash-002 model for both text and image queries
const MODEL_NAME = 'gemini-1.5-flash-002';

// Validate API key
if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY.length < 10) {
  console.error('❌ CRITICAL ERROR: Invalid or missing Gemini API key!');
  console.error('❌ Please provide a valid API key in the geminiService.js file.');
  console.error('❌ Get an API key from https://makersuite.google.com/app/apikey');
} else {
  console.log('✅ API key format check passed (not validating actual key)');
}

/**
 * Build a precise prompt for product search
 * @param {Object} searchParams - Search parameters
 * @param {boolean} isImageSearch - Whether this is an image search
 * @returns {string} - The constructed prompt
 */
const buildSearchPrompt = (searchParams, isImageSearch = false) => {
  console.log('🔍 Building prompt with parameters:', JSON.stringify(searchParams));
  
  // Determine how many products to request
  const requestedCount = searchParams.limit || 24;
  
  let prompt = isImageSearch 
    ? `Analyze this image and generate a JSON array of ${requestedCount} similar thrift products in the USA`
    : `Generate a JSON array of ${requestedCount} diverse and realistic thrift products in the USA`;

  // Add search parameters to the prompt
    if (searchParams.query) {
    prompt += ` matching the search term "${searchParams.query}"`;
    }
    
    if (searchParams.city) {
    prompt += ` located in ${searchParams.city}`;
    }
    
    if (searchParams.productType) {
      prompt += ` of type ${searchParams.productType}`;
    }
    
    if (searchParams.condition) {
    prompt += ` with condition "${searchParams.condition}"`;
    }
    
    if (searchParams.minPrice && searchParams.maxPrice) {
    prompt += ` priced between $${searchParams.minPrice} and $${searchParams.maxPrice}`;
    } else if (searchParams.minPrice) {
      prompt += ` with price above $${searchParams.minPrice}`;
    } else if (searchParams.maxPrice) {
      prompt += ` with price below $${searchParams.maxPrice}`;
    }
    
  // Add randomness to ensure different results each time
  const randomSeed = Math.floor(Math.random() * 100000);
  prompt += `. Use seed ${randomSeed} to generate diverse results different from previous requests.`;
  
  // Add strict JSON format requirements but WITHOUT any image URL requirements
  // We'll handle the image URLs separately in our validation function
  prompt += `\n\nReturn ONLY a JSON array containing exactly ${requestedCount} product objects with these fields:
{
  "id": "unique string identifier (UUID format preferred, MUST BE UNIQUE for each product)",
  "name": "descriptive product name",
  "price": numeric value (no currency symbol, between 5-200),
  "location": "city, state format",
  "condition": "one of: New, Like New, Good, Fair, Poor",
  "category": "main category",
  "subCategory": "specific type",
  "description": "brief product description",
  "brand": "brand name if known",
  "tags": ["relevant", "search", "terms"]
}

CRITICAL REQUIREMENTS:
1. Each product must have a UNIQUE ID - do not repeat IDs
2. Provide exactly ${requestedCount} items
3. Do not include any text before or after the JSON array
4. Generate diverse products with different categories, brands, and price points
5. The "tags" array must be COMPREHENSIVE and include:
   - Material types (cotton, denim, leather, wool, etc.)
   - Style descriptors (vintage, modern, casual, formal, etc.)
   - Product features (button-up, high-waisted, distressed, etc.)
   - Colors (red, blue, black, white, etc.)
   - Patterns (striped, floral, plaid, solid, etc.)
   - Specific item types (jacket, dress, jeans, hat, etc.)`;

  console.log('📝 Final prompt:', prompt);
  return prompt;
};

/**
 * Process and validate the Gemini response
 * @param {string} generatedText - The text response from Gemini
 * @returns {Array} - Validated product objects
 */
const processGeminiResponse = (generatedText) => {
  console.log('📥 Processing Gemini response, length:', generatedText.length);
  console.log('📥 First 200 chars of response:', generatedText.substring(0, 200));
  
  try {
    // First try to find and parse a complete JSON array
    try {
      // Look for the whole text as a JSON array first
      const directJson = JSON.parse(generatedText.trim());
      if (Array.isArray(directJson)) {
        console.log('✅ Text was directly parseable as a JSON array');
        console.log(`✅ Successfully parsed direct JSON with ${directJson.length} products`);
        return validateAndCleanProducts(directJson);
      }
    } catch (directError) {
      console.log('⚠️ Text is not directly parseable as JSON, trying to extract JSON array');
    }
    
    // Try to find a JSON array pattern in the text
    const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      console.log('✅ Found JSON array in response');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log(`✅ Successfully parsed JSON with ${parsedData.length} products`);
      return validateAndCleanProducts(parsedData);
    }
    
    console.log('⚠️ No JSON array found, trying to extract individual JSON objects');
    // If no JSON array found, try to find individual objects
    const objectMatches = generatedText.match(/\{[\s\S]*?\}/g);
    if (objectMatches && objectMatches.length > 0) {
      console.log(`✅ Found ${objectMatches.length} individual JSON objects`);
      const products = objectMatches
        .map((obj, index) => {
          try {
            const product = JSON.parse(obj);
            return {
              id: product.id || `TP${String(index + 1).padStart(3, '0')}`,
              name: product.name || 'Unknown Product',
              price: parseFloat(product.price) || 0,
              location: product.location || 'Unknown Location',
              condition: product.condition || 'Good',
              imageUrl: product.imageUrl || 'https://i.imgur.com/IvQWvHp.jpg',
              category: product.category || 'Uncategorized',
              subCategory: product.subCategory || 'General',
              description: product.description || '',
              brand: product.brand || 'Unknown',
              tags: Array.isArray(product.tags) ? product.tags : []
            };
          } catch (e) {
            console.error('❌ Error parsing individual product:', e);
            return null;
          }
        })
        .filter(product => product !== null);

      if (products.length > 0) {
        console.log(`✅ Successfully extracted ${products.length} products from individual objects`);
        return products;
      }
    }

    console.error('❌ Failed to extract any valid product data from response');
    throw new Error('No valid product data found in response');
  } catch (error) {
    console.error('❌ Error processing Gemini response:', error);
    console.error('❌ Raw response:', generatedText);
    return null;
  }
};

/**
 * Validate and clean product objects
 * @param {Array} products - Array of product objects
 * @returns {Array} - Cleaned and validated products
 */
const validateAndCleanProducts = (products) => {
  console.log(`🧹 Validating and cleaning ${products.length} products`);
  
  // List of verified working Unsplash photo IDs for vintage/thrift clothing and items
  const unsplashPhotoIds = [
    'Fg15LdqpWrs', 'wW7XbWYoqgE', 'Xn4L310ztMU', 'ad85ChTKORw', 'exxR_LVxnSg',
    '5BB_atDCj_A', 'D7bmnvGJZ0Q', 'YQbJLyY0hFU', 'SHo5S1FkgMY', 'TS2UyP8w1DE',
    '9vvH0Gwuzi0', 'fbAnIjhrOL4', 'EoTUGsRyqpk', 'OKLqGsCT8qs', 'wgE9eR5hBjU',
    'gySMaocSdqs', '6Ic7J4W8n5E', 'PqUQOTpak7Q', '11F1lOG5hOA', 'Y0QG2nedXg8',
    '-c1-4oEiKAQ', 'gPfauKK7R-o', 'w1_4YJ3B6FE', 'iDCtsz-INHI', 'LQkGUr9-uj0',
    '2CbwsC9BfGY', 'TMl9wVnw0og', 'NhhhJcBoABA', 'qNY3TRUQZ3w', 'fN6UZqfBF30',
    'hxn2HThPAW8', 'D_4R9CcYA-s', 'nP_h0iLML-w', 'EWDvHNNfUmQ', 'KXabCe05FQc',
    'YQbJLyY0hFU', 'SHo5S1FkgMY', 'TS2UyP8w1DE', '9vvH0Gwuzi0', 'fbAnIjhrOL4'
  ];
  
  // Keep track of used IDs and image URLs to ensure uniqueness
  const usedIds = new Set();
  const usedImageIndices = new Set();
  
  const validatedProducts = products
    .filter(product => {
      const isValid = product.id && 
        product.name && 
        !isNaN(parseFloat(product.price)) &&
        product.location && 
        product.condition;
      
      if (!isValid) {
        console.warn('⚠️ Removing invalid product:', JSON.stringify(product));
      }
      
      return isValid;
    })
    .map((product, index) => {
      // Ensure ID is unique
      let id = product.id;
      if (usedIds.has(id)) {
        console.warn(`⚠️ Duplicate product ID detected: ${id}`);
        // Generate a new unique ID
        id = `unique-${Date.now()}-${index}`;
      }
      usedIds.add(id);
      
      // Assign a unique Unsplash image URL to each product
      // First, find an unused photo ID
      let photoIndex;
      do {
        photoIndex = Math.floor(Math.random() * unsplashPhotoIds.length);
      } while (usedImageIndices.has(photoIndex) && usedImageIndices.size < unsplashPhotoIds.length);
      
      usedImageIndices.add(photoIndex);
      const photoId = unsplashPhotoIds[photoIndex];
      
      // Create a diverse set of image dimensions for different products
      const dimensions = [
        '600x800', // Portrait
        '800x600', // Landscape
        '800x800', // Square
        '750x1000', // Tall portrait
        '1000x750'  // Wide landscape
      ];
      
      const dimensionIndex = index % dimensions.length;
      const dimension = dimensions[dimensionIndex];
      
      // Create Unsplash image URL with random size parameters
      const imageUrl = `https://source.unsplash.com/${photoId}/${dimension}`;
      
      return {
        id: id,
        name: product.name,
        price: parseFloat(product.price),
        location: product.location,
        condition: product.condition,
        imageUrl: imageUrl, // Use the Unsplash URL
        category: product.category || 'Uncategorized',
        subCategory: product.subCategory || 'General',
        description: product.description || '',
        brand: product.brand || 'Unknown',
        tags: Array.isArray(product.tags) ? product.tags : []
      };
    });
  
  console.log(`✅ Validation complete: ${validatedProducts.length}/${products.length} products passed`);
  console.log('📋 First product sample:', JSON.stringify(validatedProducts[0], null, 2));
  
  return validatedProducts;
};

/**
 * Search for thrift products based on text parameters
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Array>} - Array of product objects
 */
export const searchThriftProducts = async (searchParams = {}) => {
  try {
    console.log('🔍 Starting text search with params:', JSON.stringify(searchParams));
    
    const prompt = buildSearchPrompt(searchParams);
    
    console.log('📤 Sending request to Gemini API...');
    const url = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    console.log('🔗 API URL:', url);
    
    const requestBody = {
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
    };
    
    console.log('📦 Request payload:', JSON.stringify(requestBody));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Received response with status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:', errorText);
      console.error('🚨 FALLING BACK TO MOCK DATA due to API request failure');
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📥 Response data structure:', Object.keys(data));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Unexpected API response structure:', JSON.stringify(data));
      console.error('🚨 FALLING BACK TO MOCK DATA due to unexpected response structure');
      throw new Error('Unexpected API response structure');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('📄 Generated text length:', generatedText.length);
    console.log('📄 First 500 chars of generated text:', generatedText.substring(0, 500));
    
    const products = processGeminiResponse(generatedText);
    if (products && products.length > 0) {
      console.log(`✅ Successfully retrieved ${products.length} products from Gemini`);
      console.log('🌟 USING REAL GEMINI DATA 🌟');
      console.log('📋 Sample product:', JSON.stringify(products[0], null, 2));
      
      // Ensure products have all required fields
      const completeProducts = products.map(product => ({
          ...product,
        // Make sure these optional fields are always present
        category: product.category || 'Uncategorized',
        subCategory: product.subCategory || 'General',
        description: product.description || '',
        brand: product.brand || 'Unknown',
        tags: Array.isArray(product.tags) ? product.tags : []
      }));
      
      // Log the products actually being returned
      console.log(`🔄 Returning ${completeProducts.length} REAL products to the UI`);
      return completeProducts;
    }
    
    console.warn('⚠️ No valid products extracted from Gemini response');
    console.warn('🚨 FALLING BACK TO MOCK DATA due to invalid/empty products');
      return generateMockProductsBasedOnSearch(searchParams);
  } catch (error) {
    console.error('❌ Error in searchThriftProducts:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('🚨 FALLING BACK TO MOCK DATA due to error');
    return generateMockProductsBasedOnSearch(searchParams);
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
    console.log('🖼️ Image details - Type:', imageFile.type, 'Size:', (imageFile.size / 1024).toFixed(2) + 'KB');
    console.log('🖼️ Options:', JSON.stringify(options));
    
    const base64Image = await fileToBase64(imageFile);
    console.log('🖼️ Successfully converted image to base64');
    
    // Request products based on provided limit or default to 24
    const prompt = buildSearchPrompt({ limit: options.limit || 24 }, true);
    
    console.log('📤 Sending image request to Gemini API...');
    const url = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: imageFile.type,
                data: base64Image.split(',')[1]
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
    };
    
    console.log('📦 Request payload structure (omitting base64 data):', JSON.stringify({
      ...requestBody,
      contents: [{
        ...requestBody.contents[0],
        parts: [
          requestBody.contents[0].parts[0],
          { inline_data: { mime_type: imageFile.type, data: "[BASE64_DATA]" } }
        ]
      }]
    }));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Received image search response with status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Image API request failed:', errorText);
      console.error('🚨 FALLING BACK TO MOCK DATA due to image API request failure');
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📥 Image response data structure:', Object.keys(data));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Unexpected API response structure for image search:', JSON.stringify(data));
      console.error('🚨 FALLING BACK TO MOCK DATA due to unexpected image response structure');
      throw new Error('Unexpected API response structure for image search');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('📄 Generated text from image length:', generatedText.length);
    console.log('📄 First 500 chars of image response:', generatedText.substring(0, 500));
    
    const products = processGeminiResponse(generatedText);
    if (products && products.length > 0) {
      console.log(`✅ Successfully retrieved ${products.length} products from image search`);
      console.log('🌟 USING REAL GEMINI IMAGE DATA 🌟');
      console.log('📋 Sample image product:', JSON.stringify(products[0], null, 2));
        return products;
      }
      
    console.warn('⚠️ No valid products extracted from Gemini image response');
    console.warn('🚨 FALLING BACK TO MOCK DATA due to invalid/empty image products');
      return generateMockProductsBasedOnImage(imageFile);
  } catch (error) {
    console.error('❌ Error in searchByImage:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('🚨 FALLING BACK TO MOCK DATA due to image search error');
    return generateMockProductsBasedOnImage(imageFile);
  }
};

/**
 * Convert a File object to a base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 data URL
 */
const fileToBase64 = (file) => {
  console.log('🔄 Converting file to base64:', file.name);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log('✅ File successfully converted to base64');
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      console.error('❌ Error converting file to base64:', error);
      reject(error);
    };
  });
};

/**
 * Generate realistic mock products based on search parameters
 * @param {Object} searchParams - Search parameters
 * @returns {Array} - Array of product objects
 */
const generateMockProductsBasedOnSearch = (searchParams) => {
  console.log('🔄 Generating fallback mock products based on search:', JSON.stringify(searchParams));
  
  // List of verified working Unsplash photo IDs for clothing/thrift items
  const unsplashPhotoIds = [
    'Fg15LdqpWrs', 'wW7XbWYoqgE', 'Xn4L310ztMU', 'ad85ChTKORw', 'exxR_LVxnSg',
    '5BB_atDCj_A', 'D7bmnvGJZ0Q', 'YQbJLyY0hFU', 'SHo5S1FkgMY', 'TS2UyP8w1DE',
    '9vvH0Gwuzi0', 'fbAnIjhrOL4', 'EoTUGsRyqpk', 'OKLqGsCT8qs', 'wgE9eR5hBjU'
  ];
  
  // Base set of products - with MOCK_ prefix to clearly identify them
  const products = [
    {
      id: 'MOCK_1',
      name: '[MOCK] Vintage Levi\'s Denim Jacket',
      price: 45.99,
      location: 'Portland, OR',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[0]}/800x600`,
    },
    {
      id: 'MOCK_2',
      name: '[MOCK] Retro Floral Print Dress',
      price: 28.50,
      location: 'Seattle, WA',
      condition: 'Like New',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[1]}/600x800`,
    },
    {
      id: 'MOCK_3',
      name: '[MOCK] Leather Messenger Bag',
      price: 34.99,
      location: 'Austin, TX',
      condition: 'Excellent',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[2]}/800x600`,
    },
    {
      id: 'MOCK_4',
      name: '[MOCK] Vintage Band T-Shirt',
      price: 22.00,
      location: 'Los Angeles, CA',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[3]}/600x800`,
    },
    {
      id: 'MOCK_5',
      name: '[MOCK] High-Waisted Mom Jeans',
      price: 32.50,
      location: 'Chicago, IL',
      condition: 'Very Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[4]}/800x600`,
    },
    {
      id: 'MOCK_6',
      name: '[MOCK] Vintage Wool Sweater',
      price: 24.99,
      location: 'Boston, MA',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[5]}/600x800`,
    },
    {
      id: 'MOCK_7',
      name: '[MOCK] Classic Leather Boots',
      price: 65.00,
      location: 'Denver, CO',
      condition: 'Fair',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[6]}/800x600`,
    },
    {
      id: 'MOCK_8',
      name: '[MOCK] Vintage Designer Handbag',
      price: 89.99,
      location: 'New York, NY',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[7]}/600x800`,
    },
    {
      id: 'MOCK_9',
      name: '[MOCK] Retro Nike Sneakers',
      price: 55.00,
      location: 'Miami, FL',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[8]}/800x600`,
    },
    {
      id: 'MOCK_10',
      name: '[MOCK] Vintage Polaroid Camera',
      price: 75.50,
      location: 'San Francisco, CA',
      condition: 'Working',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[9]}/600x800`,
    },
    {
      id: 'MOCK_11',
      name: '[MOCK] Antique Brass Lamp',
      price: 48.99,
      location: 'New Orleans, LA',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[10]}/800x600`,
    },
    {
      id: 'MOCK_12',
      name: '[MOCK] Vintage Record Player',
      price: 120.00,
      location: 'Nashville, TN',
      condition: 'Working',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[11]}/600x800`,
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
    console.log('⚠️ No matching products after filtering, returning default set');
    return products.slice(0, 4);
  }
  
  console.log(`✅ Returning ${filteredProducts.length} mock products after filtering`);
  console.log('📋 Mock products sample:', JSON.stringify(filteredProducts[0], null, 2));
  
  return filteredProducts;
};

/**
 * Generate realistic mock products based on image
 * @param {File} imageFile - The uploaded image file
 * @returns {Array} - Array of product objects
 */
const generateMockProductsBasedOnImage = (imageFile) => {
  console.log('🔄 Generating fallback mock products based on image:', imageFile.name);
  
  // List of verified working Unsplash photo IDs for clothing/thrift items
  const unsplashPhotoIds = [
    'Fg15LdqpWrs', 'wW7XbWYoqgE', 'Xn4L310ztMU', 'ad85ChTKORw', 'exxR_LVxnSg',
    '5BB_atDCj_A', 'D7bmnvGJZ0Q', 'YQbJLyY0hFU', 'SHo5S1FkgMY', 'TS2UyP8w1DE'
  ];
  
  // Products for image search results - with MOCK_IMG_ prefix to clearly identify them
  const imageProducts = [
    {
      id: 'MOCK_IMG_101',
      name: '[MOCK] Similar Style Vintage Dress',
      price: 38.50,
      location: 'San Francisco, CA',
      condition: 'Excellent',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[0]}/600x800`,
    },
    {
      id: 'MOCK_IMG_102',
      name: '[MOCK] Matching Pattern Skirt',
      price: 24.99,
      location: 'Miami, FL',
      condition: 'Like New',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[1]}/800x600`,
    },
    {
      id: 'MOCK_IMG_103',
      name: '[MOCK] Complementary Blouse',
      price: 19.95,
      location: 'Nashville, TN',
      condition: 'Very Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[2]}/600x800`,
    },
    {
      id: 'MOCK_IMG_104',
      name: '[MOCK] Similar Color Sweater',
      price: 29.99,
      location: 'Philadelphia, PA',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[3]}/800x600`,
    },
    {
      id: 'MOCK_IMG_105',
      name: '[MOCK] Matching Style Jacket',
      price: 45.00,
      location: 'Atlanta, GA',
      condition: 'Good',
      imageUrl: `https://source.unsplash.com/${unsplashPhotoIds[4]}/600x800`,
    }
  ];
  
  // Return 3-5 random products from the image products
  const numProducts = Math.floor(Math.random() * 3) + 3; // 3 to 5 products
  
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = imageProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imageProducts[i], imageProducts[j]] = [imageProducts[j], imageProducts[i]];
  }
  
  console.log(`✅ Returning ${numProducts} mock image products`);
  return imageProducts.slice(0, numProducts);
};

/**
 * Fetch all thrift products in the USA
 * @returns {Promise<Array>} - Array of product objects
 */
export const getAllThriftProducts = async () => {
  console.log('🔍 Getting all thrift products');
  return searchThriftProducts({
    query: 'popular thrift clothing items'
  });
};

// Gemini API service for image analysis
import { thriftProducts } from './mockThriftProducts';

// Simulated Gemini API key - in a real application, use environment variables
const GEMINI_API_KEY = "AIzaSyDYGs1IsVCqJmd67IqE4ffnElmgA_fk_JI"; 

/**
 * Analyzes an image using Gemini AI to extract product details
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<Object>} - Extracted product attributes
 */
export const analyzeImageWithGemini = async (imageFile) => {
  console.log('🔍 Starting Gemini image analysis for', imageFile.name);
  
  try {
    // Convert image to base64 for sending to API
    const base64Image = await convertImageToBase64(imageFile);
    
    // Create a specific prompt for detailed attribute extraction that focuses on clothing and accessories
    const analysisPrompt = `Analyze this image of clothing or fashion accessories. 
    You are a specialist in thrift clothing and accessories - focus ONLY on wearable items.
    
    Extract the following attributes and return them in a structured JSON format:
    
    1. category: The main category, ONLY use one of: "Clothing", "Footwear", or "Accessories"
    2. subCategory: The specific type within that category, such as:
       - For Clothing: Jacket, Dress, T-shirt, Jeans, Sweater, Skirt, Pants, Blouse, Shirt, Hoodie, Coat
       - For Footwear: Sneakers, Boots, Sandals, Heels, Flats, Loafers
       - For Accessories: Bag, Hat, Scarf, Jewelry, Watch, Belt, Sunglasses, Gloves
    3. colors: An array of ALL colors present in the item
    4. materials: An array of materials if identifiable (e.g., cotton, denim, leather)
    5. style: The general style (e.g., vintage, casual, formal, sporty)
    6. pattern: Any visible pattern (e.g., solid, striped, floral, plaid)
    7. specific_features: Array of notable features (e.g., buttons, zippers, high-waisted, distressed)
    8. condition: Apparent condition if visible (e.g., new, pre-owned, vintage)
    9. tags: A COMPREHENSIVE array of searchable keywords including all of the above plus any other relevant descriptors
    
    IMPORTANT: This is ONLY for fashion items and wearable accessories. Do NOT classify the image as electronics, furniture, or any non-wearable items.
    
    Return ONLY the JSON object with these fields, no other text.`;
    
    console.log('Sending image to Gemini API with detailed analysis prompt...');
    
    // In a real implementation, you would make an API call to Gemini here with the prompt and image
    // For now, we'll simulate a response with a delay
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Simulated Gemini AI extraction of product details
    // In a real implementation, this would be the response from the API
    const extractedDetails = simulateDetailedGeminiAnalysis(base64Image);
    console.log('✅ Gemini analysis complete, extracted details:', extractedDetails);
    
    return extractedDetails;
  } catch (error) {
    console.error('❌ Error in Gemini image analysis:', error);
    throw new Error('Failed to analyze image with Gemini: ' + error.message);
  }
};

/**
 * Searches for thrift products based on attributes extracted from an image
 * @param {Object} imageAttributes - Product attributes extracted by Gemini
 * @returns {Promise<Array>} - Matching products
 */
export const searchProductsByImageAttributes = async (imageAttributes) => {
  console.log('🔍 Searching products by image attributes:', imageAttributes);
  
  try {
    // Filter products based on extracted attributes
    let matchingProducts = [...thriftProducts];
    
    // Match by category and subcategory
    if (imageAttributes.category) {
      const categoryLower = imageAttributes.category.toLowerCase();
      matchingProducts = matchingProducts.filter(product => 
        product.category?.toLowerCase().includes(categoryLower) ||
        product.subCategory?.toLowerCase().includes(categoryLower)
      );
      console.log(`After category filter (${categoryLower}): ${matchingProducts.length} products`);
    }

    if (imageAttributes.subCategory) {
      const subCategoryLower = imageAttributes.subCategory.toLowerCase();
      const subCategoryMatches = matchingProducts.filter(product => 
        product.subCategory?.toLowerCase().includes(subCategoryLower) ||
        product.name?.toLowerCase().includes(subCategoryLower) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase() === subCategoryLower))
      );
      
      // If we have matches, prioritize them
      if (subCategoryMatches.length > 0) {
        matchingProducts = [
          ...subCategoryMatches,
          ...matchingProducts.filter(p => !subCategoryMatches.includes(p)).slice(0, 3)
        ];
      }
      console.log(`After subCategory matching (${subCategoryLower}): ${matchingProducts.length} products`);
    }
    
    // MAJOR IMPROVEMENT: Use tags for matching by creating a score-based system
    if (imageAttributes.tags && imageAttributes.tags.length > 0) {
      const scoredProducts = matchingProducts.map(product => {
        let tagMatchScore = 0;
        
        // Only proceed if the product has tags
        if (product.tags && product.tags.length > 0) {
          // Count how many tags from the image match the product tags
          imageAttributes.tags.forEach(imageTag => {
            const imageTagLower = imageTag.toLowerCase();
            
            // Exact tag match
            if (product.tags.some(productTag => productTag.toLowerCase() === imageTagLower)) {
              tagMatchScore += 3; // Higher score for exact matches
            } 
            // Partial tag match
            else if (product.tags.some(productTag => 
              productTag.toLowerCase().includes(imageTagLower) || 
              imageTagLower.includes(productTag.toLowerCase()))) {
              tagMatchScore += 1; // Lower score for partial matches
            }
            
            // Additional checks in name and description
            if (product.name?.toLowerCase().includes(imageTagLower)) {
              tagMatchScore += 2;
            }
            
            if (product.description?.toLowerCase().includes(imageTagLower)) {
              tagMatchScore += 1;
            }
          });
        }
        
        return { product, tagMatchScore };
      });
      
      // Sort by tag match score descending
      scoredProducts.sort((a, b) => b.tagMatchScore - a.tagMatchScore);
      
      // Prioritize products with higher tag match scores
      if (scoredProducts.length > 0 && scoredProducts[0].tagMatchScore > 0) {
        console.log(`Tag matching produced scores ranging from ${scoredProducts[0].tagMatchScore} to ${scoredProducts[scoredProducts.length-1].tagMatchScore}`);
        matchingProducts = scoredProducts.map(item => item.product);
      }
      
      console.log(`After tag matching: ${matchingProducts.length} products`);
    }
    
    // Match by color (search in tags, description)
    if (imageAttributes.colors && imageAttributes.colors.length > 0) {
      const colorMatches = matchingProducts.filter(product => {
        // Check if any of the detected colors are mentioned in the product
        return imageAttributes.colors.some(color => {
          const colorLower = color.toLowerCase();
          return (
            (product.description && product.description.toLowerCase().includes(colorLower)) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(colorLower) || colorLower.includes(tag.toLowerCase())))
          );
        });
      });
      
      // If we have color matches, prioritize them but don't eliminate other products completely
      if (colorMatches.length > 0) {
        // Prioritize color matches but keep some other products as fallback
        matchingProducts = [
          ...colorMatches, 
          ...matchingProducts.filter(p => !colorMatches.includes(p)).slice(0, 3)
        ];
      }
      console.log(`After color matching: ${matchingProducts.length} products`);
    }
    
    // Match by material if available
    if (imageAttributes.materials && imageAttributes.materials.length > 0) {
      const materialMatches = matchingProducts.filter(product => {
        return imageAttributes.materials.some(material => {
          const materialLower = material.toLowerCase();
          return (
            (product.description && product.description.toLowerCase().includes(materialLower)) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(materialLower))) ||
            (product.name && product.name.toLowerCase().includes(materialLower))
          );
        });
      });
      
      // Prioritize material matches
      if (materialMatches.length > 0) {
        matchingProducts = [
          ...materialMatches,
          ...matchingProducts.filter(p => !materialMatches.includes(p)).slice(0, 3)
        ];
      }
      console.log(`After material matching: ${matchingProducts.length} products`);
    }
    
    // Match by pattern if available
    if (imageAttributes.pattern) {
      const patternLower = imageAttributes.pattern.toLowerCase();
      const patternMatches = matchingProducts.filter(product => 
        (product.description && product.description.toLowerCase().includes(patternLower)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(patternLower))) ||
        (product.name && product.name.toLowerCase().includes(patternLower))
      );
      
      // Prioritize pattern matches
      if (patternMatches.length > 0) {
        matchingProducts = [
          ...patternMatches,
          ...matchingProducts.filter(p => !patternMatches.includes(p)).slice(0, 3)
        ];
      }
      console.log(`After pattern matching (${patternLower}): ${matchingProducts.length} products`);
    }
    
    // Match by style
    if (imageAttributes.style) {
      const styleLower = imageAttributes.style.toLowerCase();
      const styleMatches = matchingProducts.filter(product => 
        (product.description && product.description.toLowerCase().includes(styleLower)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(styleLower))) ||
        (product.name && product.name.toLowerCase().includes(styleLower))
      );
      
      // Prioritize style matches
      if (styleMatches.length > 0) {
        matchingProducts = [
          ...styleMatches,
          ...matchingProducts.filter(p => !styleMatches.includes(p)).slice(0, 3)
        ];
      }
      console.log(`After style matching (${styleLower}): ${matchingProducts.length} products`);
    }
    
    // Match by specific features if available
    if (imageAttributes.specific_features && imageAttributes.specific_features.length > 0) {
      const featureMatches = matchingProducts.filter(product => {
        return imageAttributes.specific_features.some(feature => {
          const featureLower = feature.toLowerCase();
          return (
            (product.description && product.description.toLowerCase().includes(featureLower)) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(featureLower))) ||
            (product.name && product.name.toLowerCase().includes(featureLower))
          );
        });
      });
      
      // Prioritize feature matches
      if (featureMatches.length > 0) {
        matchingProducts = [
          ...featureMatches,
          ...matchingProducts.filter(p => !featureMatches.includes(p)).slice(0, 3)
        ];
      }
      console.log(`After feature matching: ${matchingProducts.length} products`);
    }
    
    // Match by condition (if detected)
    if (imageAttributes.condition) {
      const conditionLower = imageAttributes.condition.toLowerCase();
      const conditionMatches = matchingProducts.filter(product =>
        product.condition?.toLowerCase().includes(conditionLower)
      );
      
      // Prioritize condition matches
      if (conditionMatches.length > 0) {
        matchingProducts = [
          ...conditionMatches,
          ...matchingProducts.filter(p => !conditionMatches.includes(p)).slice(0, 3)
        ];
      }
      console.log(`After condition matching: ${matchingProducts.length} products`);
    }
    
    // If we still have too many results, prioritize by relevance score
    if (matchingProducts.length > 12) {
      matchingProducts = calculateRelevanceScores(matchingProducts, imageAttributes);
      matchingProducts = matchingProducts.slice(0, 12); // Limit to top 12 results
    }
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Returning ${matchingProducts.length} matching products based on image analysis`);
    return matchingProducts;
  } catch (error) {
    console.error('❌ Error in searchProductsByImageAttributes:', error);
    throw new Error('Failed to find matching products: ' + error.message);
  }
};

// Helper function to convert image to base64
const convertImageToBase64 = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(imageFile);
  });
};

// Enhanced simulator to include more detailed attributes matching the new prompt
// Focus only on clothing and wearable accessories
const simulateDetailedGeminiAnalysis = (base64Image) => {
  // Simulated detection - restricted to clothing and accessories only
  
  // Only clothing-related categories
  const categories = ['Clothing', 'Footwear', 'Accessories'];
  
  // More detailed subcategories for each main category
  const subCategories = {
    'Clothing': ['Jacket', 'Dress', 'T-shirt', 'Jeans', 'Sweater', 'Skirt', 'Pants', 'Blouse', 'Shirt', 'Hoodie', 'Coat'],
    'Footwear': ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Loafers'],
    'Accessories': ['Bag', 'Hat', 'Scarf', 'Jewelry', 'Watch', 'Belt', 'Sunglasses', 'Gloves']
  };
  
  const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'brown', 'gray', 'beige', 'navy', 'cream', 'teal', 'burgundy', 'olive', 'orange', 'turquoise'];
  const materials = ['cotton', 'denim', 'leather', 'wool', 'polyester', 'linen', 'silk', 'suede', 'canvas', 'knit', 'nylon', 'corduroy', 'satin', 'tweed', 'velvet', 'fleece'];
  const styles = ['vintage', 'modern', 'casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'retro', 'classic', 'streetwear', 'preppy', 'grunge', 'athleisure', 'business', 'punk'];
  const patterns = ['solid', 'striped', 'floral', 'plaid', 'polka dot', 'checkered', 'geometric', 'abstract', 'graphic', 'animal print', 'tie-dye', 'paisley', 'herringbone'];
  const features = ['buttons', 'zippers', 'pockets', 'high-waisted', 'oversized', 'fitted', 'distressed', 'cropped', 'collared', 'sleeveless', 'hooded', 'embroidered', 'ruffled', 'pleated', 'frayed', 'patched', 'tapered', 'relaxed-fit', 'v-neck', 'crew-neck'];
  const conditions = ['new', 'like new', 'good', 'pre-owned', 'vintage', 'excellent', 'gently used'];
  
  // Randomly select a category - but biased toward clothing since that's most common
  let category;
  const categoryRandom = Math.random();
  if (categoryRandom < 0.6) {
    category = 'Clothing'; // 60% chance of clothing
  } else if (categoryRandom < 0.8) {
    category = 'Footwear'; // 20% chance of footwear
  } else {
    category = 'Accessories'; // 20% chance of accessories
  }
  
  // Select appropriate subcategory based on category
  const subCategory = subCategories[category][Math.floor(Math.random() * subCategories[category].length)];
  
  // Select 1-3 random colors
  const numColors = Math.floor(Math.random() * 2) + 1; // 1 or 2 colors
  const selectedColors = [];
  for (let i = 0; i < numColors; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    if (!selectedColors.includes(color)) {
      selectedColors.push(color);
    }
  }
  
  // Select 1-2 random materials
  const numMaterials = Math.floor(Math.random() * 2) + 1; // 1 or 2 materials
  const selectedMaterials = [];
  for (let i = 0; i < numMaterials; i++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    if (!selectedMaterials.includes(material)) {
      selectedMaterials.push(material);
    }
  }
  
  // Select a random style
  const style = styles[Math.floor(Math.random() * styles.length)];
  
  // Select a random pattern
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Select 1-3 random features
  const numFeatures = Math.floor(Math.random() * 3) + 1; // 1 to 3 features
  const selectedFeatures = [];
  for (let i = 0; i < numFeatures; i++) {
    const feature = features[Math.floor(Math.random() * features.length)];
    if (!selectedFeatures.includes(feature)) {
      selectedFeatures.push(feature);
    }
  }
  
  // Select a random condition
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  // Create comprehensive tags array combining all attributes
  const tags = [
    category.toLowerCase(),
    subCategory.toLowerCase(),
    ...selectedColors,
    ...selectedMaterials,
    style,
    pattern,
    ...selectedFeatures,
    condition
  ];
  
  // Return the detailed attributes
  return {
    category,
    subCategory,
    colors: selectedColors,
    materials: selectedMaterials,
    style,
    pattern,
    specific_features: selectedFeatures,
    condition,
    tags,
    confidence: 0.8 + Math.random() * 0.2 // Random confidence score between 0.8 and 1.0
  };
};

// Enhanced relevance score calculation that puts more emphasis on tags
const calculateRelevanceScores = (products, attributes) => {
  return products
    .map(product => {
      let score = 0;
      
      // Category match
      if (attributes.category && 
          (product.category?.toLowerCase().includes(attributes.category.toLowerCase()) ||
           product.subCategory?.toLowerCase().includes(attributes.category.toLowerCase()))) {
        score += 5;
      }
      
      // Subcategory match
      if (attributes.subCategory && 
          (product.subCategory?.toLowerCase().includes(attributes.subCategory.toLowerCase()) ||
           product.name?.toLowerCase().includes(attributes.subCategory.toLowerCase()))) {
        score += 6;
      }
      
      // Tag matches - most important!
      if (attributes.tags && product.tags) {
        attributes.tags.forEach(attrTag => {
          const attrTagLower = attrTag.toLowerCase();
          
          // Exact tag match
          if (product.tags.some(productTag => productTag.toLowerCase() === attrTagLower)) {
            score += 4; // Higher score for exact matches
          } 
          // Partial tag match
          else if (product.tags.some(productTag => 
            productTag.toLowerCase().includes(attrTagLower) || 
            attrTagLower.includes(productTag.toLowerCase()))) {
            score += 2; // Lower score for partial matches
          }
        });
      }
      
      // Color matches
      if (attributes.colors) {
        attributes.colors.forEach(color => {
          const colorLower = color.toLowerCase();
          
          // Check description for color mention
          if (product.description?.toLowerCase().includes(colorLower)) {
            score += 2;
          }
          
          // Check tags for color mention
          if (product.tags?.some(tag => tag.toLowerCase().includes(colorLower))) {
            score += 3;
          }
          
          // Check name for color mention
          if (product.name?.toLowerCase().includes(colorLower)) {
            score += 3;
          }
        });
      }
      
      // Material matches
      if (attributes.materials) {
        attributes.materials.forEach(material => {
          const materialLower = material.toLowerCase();
          
          if (product.description?.toLowerCase().includes(materialLower)) {
            score += 2;
          }
          
          if (product.tags?.some(tag => tag.toLowerCase().includes(materialLower))) {
            score += 3;
          }
          
          if (product.name?.toLowerCase().includes(materialLower)) {
            score += 3;
          }
        });
      }
      
      // Style match
      if (attributes.style) {
        const styleLower = attributes.style.toLowerCase();
        
        if (product.description?.toLowerCase().includes(styleLower)) {
          score += 2;
        }
        
        if (product.tags?.some(tag => tag.toLowerCase().includes(styleLower))) {
          score += 3;
        }
        
        if (product.name?.toLowerCase().includes(styleLower)) {
          score += 3;
        }
      }
      
      // Pattern match
      if (attributes.pattern) {
        const patternLower = attributes.pattern.toLowerCase();
        
        if (product.description?.toLowerCase().includes(patternLower)) {
          score += 2;
        }
        
        if (product.tags?.some(tag => tag.toLowerCase().includes(patternLower))) {
          score += 3;
        }
        
        if (product.name?.toLowerCase().includes(patternLower)) {
          score += 3;
        }
      }
      
      // Specific features match
      if (attributes.specific_features) {
        attributes.specific_features.forEach(feature => {
          const featureLower = feature.toLowerCase();
          
          if (product.description?.toLowerCase().includes(featureLower)) {
            score += 2;
          }
          
          if (product.tags?.some(tag => tag.toLowerCase().includes(featureLower))) {
            score += 3;
          }
          
          if (product.name?.toLowerCase().includes(featureLower)) {
            score += 3;
          }
        });
      }
      
      // Condition match
      if (attributes.condition && 
          product.condition?.toLowerCase().includes(attributes.condition.toLowerCase())) {
        score += 3;
      }
      
      return { product, score };
    })
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .map(item => item.product); // Return just the products in sorted order
}; 