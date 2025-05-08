import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchService } from '../../services/api.service';
import { getRelativeTime } from '../../utils/dateFormat';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [results, setResults] = useState({
    channels: [],
    messages: [],
    users: [],
    replies: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const performSearch = useCallback(async (searchQuery, searchType) => {
    if (!searchQuery.trim()) {
      setResults({ channels: [], messages: [], users: [], replies: [] });
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Starting search for:', searchQuery, searchType);
      const response = await searchService.search(searchQuery, searchType);
      console.log('Search response:', response.data);


      let users = [];
      let channels = [];
      let messages = [];
      let replies = [];

      if (searchType === 'users') {
        users = response.data || [];
      } else if (searchType === 'channels') {
        channels = response.data || [];
      } else {
        // Default to keyword search or "all"
        messages = response.data.messages || [];
        replies = response.data.replies || [];
        users = response.data.users || [];
        channels = response.data.channels || [];
      }

      setResults({ messages, replies, users, channels });

      if (
        (searchType === 'users' && users.length > 0) ||
        (searchType === 'channels' && channels.length > 0) ||
        (searchType === 'messages' && messages.length > 0) ||
        (searchType === 'replies' && replies.length > 0)
      ) {
        setActiveTab(searchType);
      } else {
        setActiveTab('all');
      }
      
      // Update the URL with the search parameters
      setSearchParams({ q: searchQuery, type: searchType });
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);
  
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialType);
    }
  }, [initialQuery, initialType, performSearch]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query, type);
    setActiveTab(type);
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setType(tab);
    performSearch(query, tab);
  };
  
  const getTotalResults = () => {
    return (
      (results?.channels?.length || 0) +
      (results?.messages?.length || 0) +
      (results?.users?.length || 0) +
      (results?.replies?.length || 0)
    );
  };

  return (
    <div className="search-page">
      <div className="page-header">
        <h1>Search</h1>
      </div>
      
      <div className="search-form">
        <form onSubmit={handleSubmit}>
          <div className="search-input-group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for channels, messages, or users..."
              className="form-control"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-select"
            >
              <option value="all">All</option>
              <option value="channels">Channels</option>
              <option value="messages">Messages</option>
              <option value="users">Users</option>
              <option value="replies">Replies</option>
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </form>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="loading">Searching...</div>
      ) : (
        query && (
          <div className="search-results">
            <div className="results-header">
              <h2>Results for "{query}"</h2>
              {getTotalResults() > 0 ? (
                <p>{getTotalResults()} results found</p>
              ) : (
                <p>No results found</p>
              )}
            </div>
            
            <div className="search-tabs">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => handleTabChange('all')}
                  >
                    All ({getTotalResults()})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'channels' ? 'active' : ''}`}
                    onClick={() => handleTabChange('channels')}
                  >
                    Channels ({results.channels.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
                    onClick={() => handleTabChange('messages')}
                  >
                    Messages ({results.messages.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => handleTabChange('users')}
                  >
                    Users ({results.users.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'replies' ? 'active' : ''}`}
                    onClick={() => handleTabChange('replies')}
                  >
                    Replies ({results.replies.length})
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="tab-content">
              {(activeTab === 'all' || activeTab === 'channels') && results.channels.length > 0 && (
                <div className="channels-results">
                  <h3>Channels</h3>
                  <div className="results-list">
                    {results.channels.map(channel => (
                      <div key={channel.id} className="result-item">
                        <div className="result-content">
                          <h4>
                            <Link to={`/channels/${channel.id}`}>{channel.name}</Link>
                          </h4>
                          <p>{channel.description}</p>
                          <div className="result-meta">
                          <span>Created by {channel.creator?.username || 'Unknown'}</span>
                            <span className="dot-separator">•</span>
                            <span>Created {getRelativeTime(channel.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(activeTab === 'all' || activeTab === 'messages') && results.messages.length > 0 && (
                <div className="messages-results">
                  <h3>Messages</h3>
                  <div className="results-list">
                    {results.messages.map(message => (
                      <div key={message.id} className="result-item">
                        <div className="result-content">
                          <h4>
                            <Link to={`/messages/${message.id}`}>{message.title}</Link>
                          </h4>
                          <p>{message.content.length > 150 ? `${message.content.substring(0, 150)}...` : message.content}</p>
                          <div className="result-meta">
                            <span>Posted by {message.author.username}</span>
                            <span className="dot-separator">•</span>
                            <span>Posted {getRelativeTime(message.createdAt)}</span>
                            <span className="dot-separator">•</span>
                            <span>In channel <Link to={`/channels/${message.channel.id}`}>{message.channel.name}</Link></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                <div className="users-results">
                  <h3>Users</h3>
                  <div className="results-list">
                    {results.users.map(user => (
                      <div key={user.id} className="result-item">
                        <div className="result-avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt={`${user.username}'s avatar`} className="avatar" />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="result-content">
                          <h4>
                            <Link to={`/users/${user.id}`}>{user.username}</Link>
                          </h4>
                          <p>Experience Level: {user.level}</p>
                          <div className="result-meta">
                            <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'replies') && results.replies.length > 0 && (
                <div className="replies-results">
                  <h3>Replies</h3>
                  <div className="results-list">
                    {results.replies.map(reply => (
                      <div key={reply.id} className="result-item">
                        <div className="result-content">
                          <p>{reply.content.length > 150 ? `${reply.content.substring(0, 150)}...` : reply.content}</p>
                          <div className="result-meta">
                            <span>By {reply.author.username}</span>
                            <span className="dot-separator">•</span>
                            <span>On message <Link to={`/messages/${reply.message.id}`}>{reply.message.title}</Link></span>
                            <span className="dot-separator">•</span>
                            <span>In channel <Link to={`/channels/${reply.message.channel.id}`}>{reply.message.channel.name}</Link></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              
              {getTotalResults() === 0 && (
                <div className="no-results">
                  <p>No results match your search criteria. Try different keywords or filters.</p>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Search; 