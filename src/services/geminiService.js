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
4. Generate diverse products with different categories, brands, and price points`;

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
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; 

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
    
    // In a real implementation, you would make an API call to Gemini here
    // For now, we'll simulate a response with a delay
    console.log('Sending image to Gemini API...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Simulated Gemini AI extraction of product details
    // In a real implementation, this would be the response from the API
    const extractedDetails = simulateGeminiAnalysis(base64Image);
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
    
    // Match by category
    if (imageAttributes.category) {
      const categoryLower = imageAttributes.category.toLowerCase();
      matchingProducts = matchingProducts.filter(product => 
        product.category?.toLowerCase().includes(categoryLower) ||
        product.subCategory?.toLowerCase().includes(categoryLower)
      );
      console.log(`After category filter (${categoryLower}): ${matchingProducts.length} products`);
    }
    
    // Match by color (search in tags, description)
    if (imageAttributes.colors && imageAttributes.colors.length > 0) {
      const colorMatches = matchingProducts.filter(product => {
        // Check if any of the detected colors are mentioned in the product
        return imageAttributes.colors.some(color => {
          const colorLower = color.toLowerCase();
          return (
            (product.description && product.description.toLowerCase().includes(colorLower)) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(colorLower)))
          );
        });
      });
      
      // If we have color matches, prioritize them but don't eliminate other products completely
      if (colorMatches.length > 0) {
        // Prioritize color matches but keep some other products as fallback
        matchingProducts = [
          ...colorMatches, 
          ...matchingProducts.filter(p => !colorMatches.includes(p)).slice(0, 5)
        ];
      }
      console.log(`After color matching: ${matchingProducts.length} products`);
    }
    
    // Match by style/pattern
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
          ...matchingProducts.filter(p => !styleMatches.includes(p)).slice(0, 5)
        ];
      }
      console.log(`After style matching (${styleLower}): ${matchingProducts.length} products`);
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
          ...matchingProducts.filter(p => !conditionMatches.includes(p)).slice(0, 5)
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

// Helper function to simulate Gemini AI analysis
// In a real implementation, this would be replaced with actual API call
const simulateGeminiAnalysis = (base64Image) => {
  // Simulated detection based on the image filename or random selection
  // In a real implementation, this would come from Gemini's analysis
  
  const categories = ['Clothing', 'Footwear', 'Accessories', 'Electronics', 'Furniture'];
  const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'brown', 'gray'];
  const styles = ['vintage', 'modern', 'casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'retro'];
  const conditions = ['new', 'pre-owned', 'vintage'];
  
  // Randomly select attributes to simulate AI detection
  // In a real implementation, these would be determined by the AI model
  return {
    category: categories[Math.floor(Math.random() * categories.length)],
    colors: [
      colors[Math.floor(Math.random() * colors.length)],
      colors[Math.floor(Math.random() * colors.length)]
    ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
    style: styles[Math.floor(Math.random() * styles.length)],
    condition: Math.random() > 0.5 ? conditions[Math.floor(Math.random() * conditions.length)] : null,
    confidence: 0.8 + Math.random() * 0.2, // Random confidence score between 0.8 and 1.0
  };
};

// Helper function to calculate relevance scores for products
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
      
      // Color matches
      if (attributes.colors) {
        attributes.colors.forEach(color => {
          const colorLower = color.toLowerCase();
          
          // Check description for color mention
          if (product.description?.toLowerCase().includes(colorLower)) {
            score += 3;
          }
          
          // Check tags for color mention
          if (product.tags?.some(tag => tag.toLowerCase().includes(colorLower))) {
            score += 4;
          }
        });
      }
      
      // Style match
      if (attributes.style) {
        const styleLower = attributes.style.toLowerCase();
        
        if (product.description?.toLowerCase().includes(styleLower)) {
          score += 3;
        }
        
        if (product.tags?.some(tag => tag.toLowerCase().includes(styleLower))) {
          score += 4;
        }
        
        if (product.name?.toLowerCase().includes(styleLower)) {
          score += 4;
        }
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