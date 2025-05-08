import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { channelService, messageService } from '../../services/api.service';
import { AuthContext } from '../../services/auth.context';
import { getRelativeTime } from '../../utils/dateFormat';

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Potential bug fix
// const API_BASE_URL =(process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');

const ChannelView = () => {
  const { id } = useParams();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [newMessage, setNewMessage] = useState({ title: '', content: '', channelId: id, tags: '' });
  const [screenshot, setScreenshot] = useState(null);
  
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchChannelAndMessages();
  }, [id]);

  const fetchChannelAndMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch channel details
      const channelResponse = await channelService.getChannelById(id);
      setChannel(channelResponse.data);
      
      // Fetch messages for this channel
      const messagesResponse = await messageService.getMessagesByChannel(id);
      setMessages(messagesResponse.data);
      
      setError('');
    } catch (err) {
      setError('Failed to fetch channel data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.title || !newMessage.content) {
      setError('Title and content are required');
      return;
    }
    
    try {
      const messageData = {
        ...newMessage,
        screenshot: screenshot,
      };
      
      await messageService.createMessage(messageData);
      setNewMessage({ title: '', content: '', channelId: id, tags: '' });
      setScreenshot(null);
      setShowMessageForm(false);
      fetchChannelAndMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create message');
    }
  };

  const handleScreenshotChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  if (loading) {
    return <div>Loading channel...</div>;
  }

  if (!channel) {
    return <div>Channel not found</div>;
  }

  return (
    <div className="channel-view-page">
      <div className="page-header">
        <h1>{channel.name}</h1>
        <p>{channel.description}</p>
        {currentUser && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowMessageForm(!showMessageForm)}
          >
            {showMessageForm ? 'Cancel' : 'Post Message'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showMessageForm && (
        <div className="card">
          <div className="card-header">
            <h2>Create New Message</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateMessage}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  className="form-control"
                  rows="5"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="tags">Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  className="form-control"
                  value={newMessage.tags}
                  onChange={(e) => setNewMessage({...newMessage, tags: e.target.value})}
                  placeholder="e.g. javascript, react, api"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="screenshot">Screenshot (optional)</label>
                <input
                  type="file"
                  id="screenshot"
                  className="form-control"
                  onChange={handleScreenshotChange}
                  accept="image/*"
                />
              </div>
              
              <button type="submit" className="btn btn-primary">Post Message</button>
            </form>
          </div>
        </div>
      )}

      <div className="message-list">
        {messages.length === 0 ? (
          <p>No messages in this channel yet. Be the first to post!</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="card">
              <div className="card-header">
                <h2>{message.title}</h2>
                <div className="message-meta">
                  <span>By: {message.author?.username || 'Unknown'}</span>
                  {message.createdAt && (
                    <span>Posted: {getRelativeTime(message.createdAt)}</span>
                  )}
                  {message.tags && message.tags.length > 0 && (
                    <div className="tags">
                      {message.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                <p>{message.content}</p>
                {message.screenshot && (
                  <img 
                    src={typeof message.screenshot === 'string' 
                      ? (message.screenshot.startsWith('http') 
                        ? message.screenshot 
                        : `${API_BASE_URL}${message.screenshot}`) 
                      : URL.createObjectURL(message.screenshot)} 
                    alt="Screenshot" 
                    className="screenshot" 
                  />
                )}
                <div className="rating-info">
                  <span className="rating-count">Rating: {message.totalRating || 0}</span>
                </div>
              </div>
              <div className="card-footer">
                <Link to={`/messages/${message.id}`} className="btn btn-primary">
                  View Details & Replies
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChannelView; 