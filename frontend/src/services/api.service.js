import axios from 'axios';
import authService from './auth.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 response returned from API
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Channel services
const channelService = {
  // Get all channels
  getAllChannels: () => api.get('/channels'),

  // Get channel by ID
  getChannelById: (id) => api.get(`/channels/${id}`),

  // Create a new channel
  createChannel: (data) => api.post('/channels', data),

  // Update a channel
  updateChannel: (id, data) => api.put(`/channels/${id}`, data),

  // Delete a channel
  deleteChannel: (id) => api.delete(`/channels/${id}`)
};

// Message services
const messageService = {
  // Get messages by channel
  getMessagesByChannel: (channelId) => api.get(`/messages/channel/${channelId}`),

  // Get message by ID
  getMessageById: (id) => api.get(`/messages/${id}`),

  // Get all messages (admin only)
  getAllMessages: () => api.get('/messages'),

  // Create a new message
  createMessage: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update a message
  updateMessage: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put(`/messages/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete a message
  deleteMessage: (id) => api.delete(`/messages/${id}`),

  // Rate a message
  rateMessage: (id, value) => api.post(`/messages/${id}/rate`, { value })
};

// Reply services
const replyService = {
  // Get replies for a message
  getRepliesByMessage: (messageId) => api.get(`/replies/message/${messageId}`),

  // Get child replies
  getChildReplies: (replyId) => api.get(`/replies/parent/${replyId}`),

  // Get all replies (admin only)
  getAllReplies: () => api.get('/replies'),

  // Create a new reply
  createReply: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/replies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update a reply
  updateReply: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put(`/replies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete a reply
  deleteReply: (id) => api.delete(`/replies/${id}`),

  // Rate a reply
  rateReply: (id, value) => api.post(`/replies/${id}/rate`, { value })
};

// User services
const userService = {
  // Get user profile
  getUserProfile: () => api.get('/users/profile'),

  // Update user profile
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get all users (admin only)
  getAllUsers: () => api.get('/users'),

  // Delete a user (admin only)
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Search services
const searchService = {
  // Search by keyword
  searchByKeyword: (query) => api.get(`/search/keyword?query=${encodeURIComponent(query)}`),

  // Search by username
  searchByUsername: (query) => api.get(`/search/user?query=${encodeURIComponent(query)}`),
  
  // General search method
  search: (query, type = 'all') => {
    if (type === 'users') {
      return api.get(`/search/user?query=${encodeURIComponent(query)}`);
    }
  
    // For 'channels', 'messages', 'replies', or 'all'
    return api.get(`/search/keyword?query=${encodeURIComponent(query)}`);
  },
  
  // Get users with most posts
  getUsersWithMostPosts: (limit = 10) => api.get(`/search/users/most-posts?limit=${limit}`),

  // Get users with highest ratings
  getUsersWithHighestRatings: (limit = 10) => api.get(`/search/users/highest-ratings?limit=${limit}`)
};

export {
  api,
  channelService,
  messageService,
  replyService,
  userService,
  searchService
}; 