import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../services/auth.context';
import AuthService from '../../services/auth.service';

const Navbar = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo">CodeQnA</Link>
        </div>

        <button className="mobile-menu-toggle" onHover={toggleMobileMenu}>
          <span className="menu-icon"></span>
        </button>

        <div className={`navbar-content ${mobileMenuOpen ? 'active' : ''}`}>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          <ul className="navbar-links">
            <li className="nav-item">
              <NavLink 
                to="/channels" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={() => setMobileMenuOpen(false)}
              >
                Channels
              </NavLink>
            </li>

            {currentUser ? (
              <>
                <li className="nav-item profile-dropdown">
                  <div className="profile-toggle">
                    <span className="username">{currentUser.user.username}</span>
                    {currentUser.user.avatar ? (
                      <img src={currentUser.user.avatar} alt="User avatar" className="avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {currentUser.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="dropdown-menu">
                    <NavLink 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink 
                    to="/login" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    to="/register" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 