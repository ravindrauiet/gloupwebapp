// Listing Service - Handles user product listing functionality
import { API_KEY, API_BASE_URL, MODEL_NAME } from './geminiService.jsx';

// Simulate a database of user listings
let userListings = [];
let nextListingId = 1001;

/**
 * Save a product listing to the database
 * @param {Object} productData - The product data to save
 * @returns {Promise<Object>} - The saved product with ID
 */
export const saveProductListing = async (productData) => {
  try {
    console.log('📝 Saving product listing:', productData);
    
    // In a real app, this would be a POST request to your backend
    // Here we'll simulate saving to a local array
    
    // Generate a unique ID and add timestamps
    const newProduct = {
      ...productData,
      id: `LST${nextListingId++}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending', // pending, active, sold, removed
      userId: 'current-user-id', // In a real app, this would be the authenticated user's ID
    };
    
    // Add to "database"
    userListings.push(newProduct);
    
    console.log('✅ Product listing saved successfully:', newProduct);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return newProduct;
  } catch (error) {
    console.error('❌ Error saving product listing:', error);
    throw new Error('Failed to save product listing: ' + error.message);
  }
};

/**
 * Get all listings for the current user
 * @returns {Promise<Array>} - Array of user's product listings
 */
export const getUserListings = async () => {
  try {
    console.log('🔍 Fetching user listings');
    
    // In a real app, this would be a GET request to your backend
    // filtered by the authenticated user ID
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return listings for the "current user"
    const currentUserListings = userListings.filter(listing => 
      listing.userId === 'current-user-id'
    );
    
    console.log(`✅ Retrieved ${currentUserListings.length} user listings`);
    return currentUserListings;
  } catch (error) {
    console.error('❌ Error fetching user listings:', error);
    throw new Error('Failed to fetch user listings: ' + error.message);
  }
};

/**
 * Analyze a product image using Gemini AI to extract product details
 * @param {File} imageFile - The product image to analyze
 * @returns {Promise<Object>} - Extracted product details
 */
export const analyzeProductImage = async (imageFile) => {
  try {
    console.log('🔍 Analyzing product image for listing:', imageFile.name);
    
    // Convert image to base64 for the API request
    const base64Image = await fileToBase64(imageFile);
    console.log('✅ Image converted to base64');
    
    // Create a specific prompt for detailed fashion item analysis
    const analysisPrompt = `
    Identify and classify this fashion item in the image.
    
    Provide a structured JSON response with the following fields:
    - "category": The broad category (e.g., "Clothing", "Accessory", "Footwear", "Bag").
    - "type": The specific item type (e.g., "T-shirt", "Jeans", "Watch", "Sneakers", "Handbag").
    - "colors": Array of colors detected in the item.
    - "material": The fabric or material (e.g., "Denim", "Leather", "Cotton", "Metal", "Plastic").
    - "gender": The intended wearer gender ("Men", "Women", "Unisex", or "Unknown").
    - "style": The fashion style (e.g., "Casual", "Formal", "Sporty", "Luxury", "Vintage").
    - "pattern": Any visible pattern (e.g., "Solid", "Striped", "Floral", "Plaid").
    - "condition": Apparent condition ("New", "Like New", "Good", "Fair").
    - "brand": The visible brand name (if identifiable) or "Unknown".
    - "description": A brief detailed description of the item (about 1-2 sentences).
    - "tags": An array of relevant keywords for this item for search purposes.
    
    Return ONLY the JSON object with these fields, no other text.
    `;
    
    // In a real implementation, this would be an actual API call to Gemini
    // For demo purposes, we'll simulate the response
    console.log('🔄 Sending image to Gemini API for analysis...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, return simulated response
    // In a real implementation, you would make the actual API call:
    /*
    const url = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [
          { text: analysisPrompt },
          { 
            inline_data: {
              mime_type: imageFile.type,
              data: base64Image.split(',')[1]
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON object from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from API response');
    }
    
    const extractedDetails = JSON.parse(jsonMatch[0]);
    */
    
    // Simulated response for demo purposes
    const extractedDetails = simulateProductAnalysis(imageFile.name);
    
    console.log('✅ Product analysis complete:', extractedDetails);
    return extractedDetails;
  } catch (error) {
    console.error('❌ Error analyzing product image:', error);
    throw new Error('Failed to analyze product image: ' + error.message);
  }
};

/**
 * Convert file to base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 data URL
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Simulate Gemini AI analysis for a product image
 * @param {string} fileName - The name of the file for context-aware simulation
 * @returns {Object} - Simulated product analysis
 */
const simulateProductAnalysis = (fileName) => {
  // Use filename to guess what kind of item it might be (for demo)
  const fileNameLower = fileName.toLowerCase();
  
  // Define possible item types based on keywords that might be in the filename
  const categories = {
    'shirt': { category: 'Clothing', type: 'Shirt' },
    'tshirt': { category: 'Clothing', type: 'T-shirt' },
    't-shirt': { category: 'Clothing', type: 'T-shirt' },
    'dress': { category: 'Clothing', type: 'Dress' },
    'jeans': { category: 'Clothing', type: 'Jeans' },
    'pants': { category: 'Clothing', type: 'Pants' },
    'jacket': { category: 'Clothing', type: 'Jacket' },
    'hoodie': { category: 'Clothing', type: 'Hoodie' },
    'sweater': { category: 'Clothing', type: 'Sweater' },
    'skirt': { category: 'Clothing', type: 'Skirt' },
    
    'shoes': { category: 'Footwear', type: 'Shoes' },
    'sneakers': { category: 'Footwear', type: 'Sneakers' },
    'boots': { category: 'Footwear', type: 'Boots' },
    'sandals': { category: 'Footwear', type: 'Sandals' },
    
    'watch': { category: 'Accessory', type: 'Watch' },
    'necklace': { category: 'Accessory', type: 'Necklace' },
    'earrings': { category: 'Accessory', type: 'Earrings' },
    'bracelet': { category: 'Accessory', type: 'Bracelet' },
    'hat': { category: 'Accessory', type: 'Hat' },
    
    'bag': { category: 'Bag', type: 'Handbag' },
    'handbag': { category: 'Bag', type: 'Handbag' },
    'backpack': { category: 'Bag', type: 'Backpack' },
    'purse': { category: 'Bag', type: 'Purse' },
  };
  
  // Detect item type from filename or use default
  let detectedItem = { category: 'Clothing', type: 'T-shirt' }; // Default
  
  // Check if any keywords match the filename
  for (const [keyword, item] of Object.entries(categories)) {
    if (fileNameLower.includes(keyword)) {
      detectedItem = item;
      break;
    }
  }
  
  // Colors
  const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'gray', 'brown', 'navy', 'beige'];
  const detectedColors = [];
  
  // Check filename for color hints
  for (const color of colors) {
    if (fileNameLower.includes(color)) {
      detectedColors.push(color);
    }
  }
  
  // If no colors found in filename, pick 1-2 random colors
  if (detectedColors.length === 0) {
    const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
    detectedColors.push(randomColor1);
    
    // 50% chance of a second color
    if (Math.random() > 0.5) {
      let randomColor2;
      do {
        randomColor2 = colors[Math.floor(Math.random() * colors.length)];
      } while (randomColor2 === randomColor1);
      
      detectedColors.push(randomColor2);
    }
  }
  
  // Materials
  const materialMap = {
    'Clothing': ['Cotton', 'Polyester', 'Wool', 'Linen', 'Denim', 'Silk', 'Velvet', 'Fleece'],
    'Footwear': ['Leather', 'Canvas', 'Suede', 'Synthetic', 'Rubber', 'Mesh'],
    'Accessory': ['Metal', 'Leather', 'Plastic', 'Fabric', 'Wood', 'Glass'],
    'Bag': ['Leather', 'Canvas', 'Nylon', 'Polyester', 'Suede', 'Synthetic']
  };
  
  const materials = materialMap[detectedItem.category] || materialMap['Clothing'];
  const material = materials[Math.floor(Math.random() * materials.length)];
  
  // Generate a realistic product description based on the detected attributes
  const generateDescription = (item, colors, material, style) => {
    const colorText = colors.length > 1 ? `${colors.join(' and ')}` : colors[0];
    const descriptions = [
      `Beautiful ${colorText} ${material.toLowerCase()} ${item.type.toLowerCase()} in ${style.toLowerCase()} style. Perfect for any occasion.`,
      `Stylish ${style.toLowerCase()} ${item.type.toLowerCase()} made of high-quality ${material.toLowerCase()} in ${colorText}.`,
      `Classic ${colorText} ${item.type.toLowerCase()} made from ${material.toLowerCase()}, ideal for a ${style.toLowerCase()} look.`,
      `Trendy ${style.toLowerCase()} ${item.type.toLowerCase()} in ${colorText} ${material.toLowerCase()}, barely worn and in great condition.`,
      `Fashionable ${colorText} ${material.toLowerCase()} ${item.type.toLowerCase()} with a ${style.toLowerCase()} design.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };
  
  // Styles
  const styles = ['Casual', 'Formal', 'Sporty', 'Vintage', 'Bohemian', 'Minimalist', 'Elegant', 'Streetwear'];
  const style = styles[Math.floor(Math.random() * styles.length)];
  
  // Patterns
  const patterns = ['Solid', 'Striped', 'Floral', 'Plaid', 'Polka dot', 'Checkered', 'Geometric', 'Abstract'];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Brands (popular thrift brands)
  const brands = [
    'Levi\'s', 'Nike', 'Adidas', 'H&M', 'Zara', 'Gap', 'Ralph Lauren', 
    'Tommy Hilfiger', 'Calvin Klein', 'Unknown', 'Vintage'
  ];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  
  // Gender
  const genders = ['Men', 'Women', 'Unisex'];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  
  // Conditions
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  // Generate tags from all the attributes
  const generateTags = (item, colors, material, style, pattern, brand) => {
    const tags = [
      item.category.toLowerCase(),
      item.type.toLowerCase(),
      ...colors.map(c => c.toLowerCase()),
      material.toLowerCase(),
      style.toLowerCase(),
      pattern.toLowerCase()
    ];
    
    if (brand !== 'Unknown') {
      tags.push(brand.toLowerCase());
    }
    
    // Add some common search terms
    if (item.category === 'Clothing') {
      tags.push('apparel', 'clothes', 'fashion');
    } else if (item.category === 'Footwear') {
      tags.push('shoes', 'footwear');
    } else if (item.category === 'Accessory') {
      tags.push('accessories');
    } else if (item.category === 'Bag') {
      tags.push('bags', 'purse');
    }
    
    return tags;
  };
  
  // Assemble the simulated analysis result
  const description = generateDescription(detectedItem, detectedColors, material, style);
  const tags = generateTags(detectedItem, detectedColors, material, style, pattern, brand);
  
  return {
    category: detectedItem.category,
    type: detectedItem.type,
    colors: detectedColors,
    material: material,
    gender: gender,
    style: style,
    pattern: pattern,
    condition: condition,
    brand: brand,
    description: description,
    tags: tags,
    confidence: 0.85 + (Math.random() * 0.15) // Random confidence between 0.85 and 1.0
  };
}; 