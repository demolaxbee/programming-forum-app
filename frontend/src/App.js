import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page components
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChannelList from './pages/channels/ChannelList';
import ChannelView from './pages/channels/ChannelView';
import MessageView from './pages/messages/MessageView';
import UserProfile from './pages/users/UserProfile';
import Search from './pages/search/Search';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';

// Auth service
import AuthService from './services/auth.service';

// Auth context
import { AuthContext } from './services/auth.context';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const authContextValue = {
    currentUser,
    setCurrentUser
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="App">
        <Navbar />
        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/channels" element={<ChannelList />} />
            <Route path="/channels/:id" element={<ChannelView />} />
            <Route path="/messages/:id" element={<MessageView />} />
            <Route 
              path="/profile" 
              element={currentUser ? <UserProfile /> : <Navigate to="/login" />} 
            />
            <Route path="/search" element={<Search />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

export default App; 