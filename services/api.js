import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const tokenType = await AsyncStorage.getItem('token_type');
    return token ? `${tokenType || 'Bearer'} ${token}` : null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !options.skipAuth) {
      headers.Authorization = token;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`HTTP ${response.status} error for ${endpoint}:`, errorData);
      
      // Log validation details if they exist
      if (errorData.details && Array.isArray(errorData.details)) {
        console.error('Validation errors:', errorData.details);
        errorData.details.forEach((detail, index) => {
          console.error(`Error ${index + 1}:`, detail);
        });
      }
      
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // POST /auth/signup - Register new user
  signup: async (userData) => {
    return makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true,
    });
  },

  // POST /auth/login - User login with JWT token
  login: async (credentials) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  },

  // GET /auth/users/{user_id} - Get user profile by ID
  getUserProfile: async (userId) => {
    return makeRequest(`/auth/users/${userId}`);
  },

  // POST /auth/users/{user_id}/additional-info - Update weight/height/goal
  updateUserInfo: async (userId, additionalInfo) => {
    return makeRequest(`/auth/users/${userId}/additional-info`, {
      method: 'POST',
      body: JSON.stringify(additionalInfo),
    });
  },

  // GET /auth/users/by-username/{username} - Get user profile by username
  getUserByUsername: async (username) => {
    return makeRequest(`/auth/users/by-username/${username}`);
  },
};

// Fasting Session API
export const fastingAPI = {
  // POST /fasting/start - Start a new fasting session
  startSession: async (sessionData) => {
    return makeRequest('/fasting/start', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  // POST /fasting/{session_id}/end - End/complete a fasting session
  endSession: async (sessionId, endData = {}) => {
    return makeRequest(`/fasting/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify(endData),
    });
  },

  // GET /fasting/sessions/{user_id} - Get all user's fasting sessions
  getUserSessions: async (userId) => {
    return makeRequest(`/fasting/sessions/${userId}`);
  },

  // GET /fasting/active/{user_id} - Get user's current active session
  getActiveSession: async (userId) => {
    return makeRequest(`/fasting/active/${userId}`);
  },

  // GET /fasting/stats/{user_id} - Get detailed statistics
  getStats: async (userId) => {
    return makeRequest(`/fasting/stats/${userId}`);
  },

  // GET /fasting/streaks/{user_id} - Get streak information
  getStreaks: async (userId) => {
    return makeRequest(`/fasting/streaks/${userId}`);
  },

  // GET /fasting/analytics/{user_id} - Get analytics data
  getAnalytics: async (userId, period = 'week') => {
    return makeRequest(`/fasting/analytics/${userId}?period=${period}`);
  },

  // GET /fasting/timeline/{user_id} - Get timeline/calendar data
  getTimeline: async (userId, days = 30) => {
    return makeRequest(`/fasting/timeline/${userId}?days=${days}`);
  },

  // PUT /fasting/{session_id} - Update session
  updateSession: async (sessionId, updateData) => {
    return makeRequest(`/fasting/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // DELETE /fasting/{session_id} - Cancel session
  cancelSession: async (sessionId) => {
    return makeRequest(`/fasting/${sessionId}`, {
      method: 'DELETE',
    });
  },

  // POST /fasting/{session_id}/pause - Pause session
  pauseSession: async (sessionId) => {
    return makeRequest(`/fasting/${sessionId}/pause`, {
      method: 'POST',
    });
  },

  // POST /fasting/{session_id}/resume - Resume session
  resumeSession: async (sessionId) => {
    return makeRequest(`/fasting/${sessionId}/resume`, {
      method: 'POST',
    });
  },
};

// Goals API
export const goalsAPI = {
  // POST /goals?user_id={id} - Create goal
  createGoal: async (userId, goalData) => {
    return makeRequest(`/goals?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  // GET /goals/{user_id} - Get user goals
  getUserGoals: async (userId) => {
    return makeRequest(`/goals/${userId}`);
  },

  // PUT /goals/{goal_id} - Update goal
  updateGoal: async (goalId, goalData) => {
    return makeRequest(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  },

  // GET /goals/progress/{user_id} - Get progress
  getProgress: async (userId) => {
    return makeRequest(`/goals/progress/${userId}`);
  },

  // DELETE /goals/{goal_id} - Delete goal
  deleteGoal: async (goalId) => {
    return makeRequest(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  },
};

// General API
export const generalAPI = {
  // GET / - Welcome message
  getWelcome: async () => {
    return makeRequest('/', { skipAuth: true });
  },

  // GET /items/{item_id} - Test endpoint
  getItem: async (itemId) => {
    return makeRequest(`/items/${itemId}`);
  },
};

// User management helper functions
export const userManager = {
  // Helper function to decode JWT payload
  decodeJWT: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  },

  // Store user data after login
  storeUserSession: async (loginResponse) => {
    try {
      await AsyncStorage.setItem('access_token', loginResponse.access_token);
      await AsyncStorage.setItem('token_type', loginResponse.token_type);
      
      // If user data is included in login response, store it
      // Try different possible formats of user data in response
      let userData = null;
      if (loginResponse.user) {
        userData = loginResponse.user;
      } else if (loginResponse.user_data) {
        userData = loginResponse.user_data;
      } else if (loginResponse.id) {
        // If user data is at root level
        userData = {
          id: loginResponse.id,
          email: loginResponse.email,
          username: loginResponse.username,
          ...loginResponse
        };
      } else if (loginResponse.access_token) {
        // For JWT-only responses, decode the token to get user info
        console.log('JWT-only response, decoding token for user info...');
        const jwtPayload = userManager.decodeJWT(loginResponse.access_token);
        if (jwtPayload) {
          console.log('Full JWT payload:', jwtPayload);
          // Check different possible fields for user ID in JWT
          const userId = jwtPayload.user_id || jwtPayload.id || jwtPayload.uid || jwtPayload.sub;
          
          userData = {
            id: userId, // Use whatever ID is in the JWT
            email: jwtPayload.sub || jwtPayload.email,
            username: (jwtPayload.sub || jwtPayload.email || '').split('@')[0],
            exp: jwtPayload.exp,
            fromJWT: true,
            jwtPayload: jwtPayload // Store full payload for debugging
          };
          console.log('Extracted user data from JWT:', userData);
        }
      }
      
      if (userData) {
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        console.log('Stored user data:', userData);
      } else {
        console.warn('No user data found in login response:', loginResponse);
      }
    } catch (error) {
      console.error('Error storing user session:', error);
      throw error;
    }
  },

  // Get stored user data
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Clear user session
  clearSession: async () => {
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'token_type',
        'user_data'
      ]);
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  },

  // Get current user ID (fallback method)
  getCurrentUserId: async () => {
    try {
      const userData = await userManager.getUserData();
      if (userData?.id) {
        return userData.id;
      }
      
      // If no user data, check if we have tokens and can decode user info
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        console.log('Found token but no user data - user needs to re-authenticate');
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  },
};

export default {
  authAPI,
  fastingAPI,
  goalsAPI,
  generalAPI,
  userManager,
};