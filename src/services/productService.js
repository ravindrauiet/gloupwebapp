// Mock product data
const mockProducts = [
  {
    id: "prod1",
    title: "Vintage Denim Jacket",
    description: "Classic vintage denim jacket in excellent condition. Perfect for layering in all seasons. Features button-up front, two chest pockets, and adjustable waistband.",
    price: 89.99,
    category: "Clothing",
    type: "Jacket",
    brand: "Levi's",
    condition: "Good",
    material: "Denim",
    color: "Blue",
    pattern: "Solid",
    style: "Vintage",
    gender: "Unisex",
    location: "Portland, OR",
    seller: {
      id: "seller123",
      name: "Vintage Finds",
      rating: 4.8,
      verified: true,
      joinDate: "2021-03-15"
    },
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588099768523-f4e6a5679d88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["vintage", "denim", "jacket", "unisex", "90s"],
    shipping: "standard",
    createdAt: "2023-06-15T10:30:00Z",
    views: 243,
    favorites: 18,
    featured: true
  },
  {
    id: "prod2",
    title: "Nike Air Max Sneakers",
    description: "Nike Air Max in great condition, barely worn. Comfortable and stylish for everyday wear.",
    price: 120.00,
    category: "Footwear",
    type: "Sneakers",
    condition: "Like New",
    brand: "Nike",
    gender: "Men",
    color: "Black",
    material: "Synthetic",
    location: "Seattle, WA",
    seller: {
      id: "seller456",
      name: "SneakerHead",
      rating: 4.9,
      verified: true,
      joinDate: "2022-01-10"
    },
    images: [
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["nike", "sneakers", "athletic", "shoes", "sports"],
    shipping: "free",
    createdAt: "2023-08-10T14:20:00Z",
    views: 189,
    favorites: 24,
    featured: true
  },
  {
    id: "prod3",
    title: "Leather Tote Bag",
    description: "Elegant leather tote bag with plenty of space. Perfect for work or daily use.",
    price: 75.50,
    category: "Bag",
    type: "Tote",
    condition: "New",
    brand: "Coach",
    gender: "Women",
    color: "Brown",
    material: "Leather",
    location: "New York, NY",
    seller: {
      id: "seller789",
      name: "LuxuryFinds",
      rating: 4.7,
      verified: true,
      joinDate: "2021-11-05"
    },
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["leather", "tote", "bag", "purse", "designer"],
    shipping: "standard",
    createdAt: "2023-08-20T09:15:00Z",
    views: 157,
    favorites: 31,
    featured: true
  },
  {
    id: "prod4",
    title: "Cashmere Sweater",
    description: "Soft cashmere sweater, perfect for fall and winter. Timeless design that goes with any outfit.",
    price: 65.00,
    category: "Clothing",
    type: "Sweater",
    condition: "Good",
    brand: "J.Crew",
    gender: "Women",
    color: "Beige",
    material: "Cashmere",
    location: "Chicago, IL",
    seller: {
      id: "seller101",
      name: "StyleSwap",
      rating: 4.5,
      verified: false,
      joinDate: "2022-05-20"
    },
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["cashmere", "sweater", "winter", "soft", "cozy"],
    shipping: "standard",
    createdAt: "2023-08-05T11:45:00Z",
    views: 98,
    favorites: 12,
    featured: true
  }
];

/**
 * Simulates API call to get all products
 * @param {Object} filters - Optional filters for products
 * @returns {Promise<Array>} Array of products
 */
export const getAllProducts = async (filters = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would be an API call with filters
  // return fetch('/api/products').then(res => res.json());
  
  return mockProducts;
};

/**
 * Simulates API call to get featured products
 * @returns {Promise<Array>} Array of featured products
 */
export const getFeaturedProducts = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter products marked as featured
  return mockProducts.filter(product => product.featured);
};

/**
 * Simulates API call to get a product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product object
 */
export const getProductById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const product = mockProducts.find(p => p.id === id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return product;
};

/**
 * Simulates API call to save a product listing
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Saved product
 */
export const saveProductListing = async (productData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would be a POST to the API
  // return fetch('/api/products', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(productData),
  // }).then(res => res.json());
  
  const newProduct = {
    id: `prod${Date.now().toString(36)}`,
    ...productData,
    createdAt: new Date().toISOString(),
    views: 0,
    favorites: 0
  };
  
  return newProduct;
};

/**
 * Simulates AI analysis of a product image
 * @param {File} imageFile - Image file to analyze
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeProductImage = async (imageFile) => {
  // Simulate API delay and processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, this would upload the image to an AI service
  // return fetch('/api/analyze-image', {
  //   method: 'POST',
  //   body: formData,
  // }).then(res => res.json());
  
  // Return mock analysis results
  return {
    category: 'Clothing',
    type: 'Jacket',
    colors: ['Blue', 'Indigo'],
    material: 'Denim',
    condition: 'Good',
    brand: 'Levi\'s',
    style: 'Vintage',
    pattern: 'Solid',
    gender: 'Unisex',
    description: 'Vintage denim jacket in blue. Appears to be in good condition with minimal wear. Classic cut with button closure and chest pockets.',
    tags: ['vintage', 'denim', 'jacket', 'blue', 'casual']
  };
}; 