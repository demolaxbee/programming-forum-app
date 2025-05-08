import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { channelService } from '../../services/api.service';
import { AuthContext } from '../../services/auth.context';
import { getRelativeTime } from '../../utils/dateFormat';

const ChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', description: '' });
  
  const { currentUser } = useContext(AuthContext);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await channelService.getAllChannels();
      setChannels(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch channels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchChannels();
    }
  }, [currentUser]);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    
    if (!newChannel.name) {
      setError('Channel name is required');
      return;
    }
    
    try {
      await channelService.createChannel(newChannel);
      setNewChannel({ name: '', description: '' });
      setShowCreateForm(false);
      fetchChannels();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel');
    }
  };

  // Redirect non-logged in users to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div>Loading channels...</div>;
  }

  return (
    <div className="channel-page">
      <div className="page-header">
        <h1>Channels</h1>
        {currentUser && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Channel'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h2>Create New Channel</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateChannel}>
              <div className="form-group">
                <label htmlFor="name">Channel Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="form-control"
                  value={newChannel.description}
                  onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                />
              </div>
              
              <button type="submit" className="btn btn-primary">Create Channel</button>
            </form>
          </div>
        </div>
      )}

      <div className="channel-list">
        {channels.length === 0 ? (
          <p>No channels found. Be the first to create one!</p>
        ) : (
          channels.map((channel) => (
            <div key={channel.id} className="card">
              <div className="card-header">
                <h2>{channel.name}</h2>
              </div>
              <div className="card-body">
                <p>{channel.description || 'No description provided.'}</p>
                <div className="channel-meta">
                  <span>Created by: {channel.creator?.username || 'Unknown'}</span>
                  {channel.createdAt && (
                    <span>Created: {getRelativeTime(channel.createdAt)}</span>
                  )}
                </div>
              </div>
              <div className="card-footer">
                <Link to={`/channels/${channel.id}`} className="btn btn-primary">
                  View Channel
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChannelList; 