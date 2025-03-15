import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
console.log("Initializing Firebase with config:", {
  apiKey: firebaseConfig.apiKey?.substring(0, 5) + "...", // Only log first few chars for security
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add additional scopes if needed
// googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Auth result
 */
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Email login error:", error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in with Google
 * @returns {Promise} - Auth result
 */
export const loginWithGoogle = async () => {
  try {
    console.log("Attempting Google sign-in...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful");
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google login error:", error.code, error.message);
    
    // More detailed error information
    if (error.code === 'auth/unauthorized-domain') {
      return { 
        success: false, 
        error: "This domain is not authorized for OAuth operations. Add your domain to the Firebase Console's OAuth redirect domains list." 
      };
    }
    
    if (error.code === 'auth/operation-not-allowed') {
      return { 
        success: false, 
        error: "Google sign-in is not enabled for this Firebase project. Enable it in the Firebase Console's Authentication section." 
      };
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Register new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Auth result
 */
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Registration error:", error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise} - Result
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Sign out current user
 * @returns {Promise} - Result
 */
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get current user
 * @returns {Object|null} - Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Export auth instance for use with React context
export { auth }; 