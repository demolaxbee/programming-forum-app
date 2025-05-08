import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  // Register a new user
  async register(username, email, password, level = 'Beginner') {
    return axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password,
      level
    });
  }

  // Login user
  async login(username, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    
    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }

  // Logout user
  logout() {
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  // Get authentication token
  getAuthHeader() {
    const user = this.getCurrentUser();
    
    if (user && user.accessToken) {
      return { Authorization: `Bearer ${user.accessToken}` };
    } else {
      return {};
    }
  }
}

export default new AuthService(); 