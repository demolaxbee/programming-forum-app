import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api.service';
import { AuthContext } from '../../services/auth.context';
import AuthService from '../../services/auth.service';

const UserProfile = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    level: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserProfile();
      setProfileData(response.data);
      
      // Initialize the form data
      setFormData({
        username: response.data.username,
        email: response.data.email,
        password: '',
        confirmPassword: '',
        level: response.data.level
      });
      
      setError('');
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        level: formData.level
      };
      
      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // Add avatar if provided
      if (avatar) {
        updateData.avatar = avatar;
      }
      
      const response = await userService.updateProfile(updateData);
      
      // Update the local user info
      const updatedUser = {
        ...currentUser,
        user: {
          ...currentUser.user,
          username: response.data.user.username,
          email: response.data.user.email,
          level: response.data.user.level,
          avatar: response.data.user.avatar
        }
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEditMode(false);
      fetchUserProfile();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profileData) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>User Profile</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {editMode ? (
        <div className="card">
          <div className="card-header">
            <h2>Edit Profile</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="level">Experience Level</label>
                <select
                  id="level"
                  name="level"
                  className="form-control"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="avatar">Profile Picture</label>
                <input
                  type="file"
                  id="avatar"
                  className="form-control"
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="profile-details">
          <div className="card">
            <div className="card-header">
              <h2>User Information</h2>
            </div>
            <div className="card-body">
              <div className="profile-item">
                <div className="profile-avatar">
                  {profileData.avatar ? (
                    <img 
                    src={
                      profileData.avatar?.startsWith('http')
                        ? profileData.avatar
                        : `http://localhost:5000${profileData.avatar}`
                    }
                    alt="Profile Avatar"
                    className="avatar" 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {profileData.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="profile-info">
                  <p><strong>Username:</strong> {profileData.username}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Level:</strong> {profileData.level}</p>
                  <p><strong>Member Since:</strong> {new Date(profileData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Statistics */}
          {profileData.stats && (
            <div className="card">
              <div className="card-header">
                <h2>Activity Statistics</h2>
              </div>
              <div className="card-body">
                <p><strong>Total Posts:</strong> {profileData.stats.totalPosts}</p>
                <p><strong>Messages:</strong> {profileData.stats.messageCount}</p>
                <p><strong>Replies:</strong> {profileData.stats.replyCount}</p>
                <p><strong>Ratings Received:</strong> {profileData.stats.totalRatings}</p>
                <p><strong>Average Rating:</strong> {profileData.stats.averageRating.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 