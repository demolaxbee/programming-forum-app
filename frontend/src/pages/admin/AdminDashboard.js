import React, { useState, useEffect, useContext } from 'react';
import { userService, channelService, messageService, replyService } from '../../services/api.service';
import { AuthContext } from '../../services/auth.context';

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser?.user?.isAdmin) {
      window.location.href = '/channels';
      return;
    }
    fetchData();
  }, [currentUser, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      switch (activeTab) {
        case 'users':
          const usersResponse = await userService.getAllUsers();
          setUsers(usersResponse.data);
          break;
        case 'channels':
          const channelsResponse = await channelService.getAllChannels();
          setChannels(channelsResponse.data);
          break;
        case 'messages':
          const messagesResponse = await messageService.getAllMessages();
          setMessages(messagesResponse.data);
          break;
        case 'replies':
          const repliesResponse = await replyService.getAllReplies();
          setReplies(repliesResponse.data);
          break;
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm('Are you sure you want to delete this channel?')) return;
    
    try {
      await channelService.deleteChannel(channelId);
      setChannels(channels.filter(channel => channel.id !== channelId));
    } catch (err) {
      setError('Failed to delete channel');
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await messageService.deleteMessage(messageId);
      setMessages(messages.filter(message => message.id !== messageId));
    } catch (err) {
      setError('Failed to delete message');
      console.error(err);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    
    try {
      await replyService.deleteReply(replyId);
      setReplies(replies.filter(reply => reply.id !== replyId));
    } catch (err) {
      setError('Failed to delete reply');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          Channels
        </button>
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button 
          className={`tab ${activeTab === 'replies' ? 'active' : ''}`}
          onClick={() => setActiveTab('replies')}
        >
          Replies
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-list">
            <h2>Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user => !user.username.startsWith('Deleted User'))
                  .map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.level}</td>
                      <td>
                        {!user.isAdmin && (
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="channels-list">
            <h2>Channels</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {channels.map(channel => (
                  <tr key={channel.id}>
                    <td>{channel.name}</td>
                    <td>{channel.description}</td>
                    <td>{channel.creator?.username}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteChannel(channel.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-list">
            <h2>Messages</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Channel</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(message => (
                  <tr key={message.id}>
                    <td>{message.title}</td>
                    <td>{message.author?.username}</td>
                    <td>{message.channel?.name}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'replies' && (
          <div className="replies-list">
            <h2>Replies</h2>
            <table>
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Author</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {replies.map(reply => (
                  <tr key={reply.id}>
                    <td>{reply.content.substring(0, 50)}...</td>
                    <td>{reply.author?.username}</td>
                    <td>{reply.message?.title}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteReply(reply.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 