import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messageService, replyService } from '../../services/api.service';
import { AuthContext } from '../../services/auth.context';
import { getRelativeTime } from '../../utils/dateFormat';

// Get API base URL from environment or use default
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL =(process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');

const MessageView = () => {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReply, setNewReply] = useState({ content: '', messageId: id });
  const [screenshot, setScreenshot] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const { currentUser } = useContext(AuthContext);

  const fetchMessageAndReplies = useCallback(async () => {
    try {
      setLoading(true);
  
      // Get the full message (including nested replies)
      const messageResponse = await messageService.getMessageById(id);
      setMessage(messageResponse.data);
  
      // Just use the nested replies from the response
      const originalReplies = messageResponse.data.replies || [];
      const topLevelReplies = originalReplies.filter(reply => !reply.parentReplyId);
      setReplies(topLevelReplies);
      setError('');
    } catch (err) {
      setError('Failed to fetch message data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchMessageAndReplies();
  }, [fetchMessageAndReplies]);

  useEffect(() => {
    if (replies.length > 0) {
      console.log('Replies structure:', JSON.stringify(replies, null, 2));
    }
  }, [replies]);

  const handleCreateReply = async (e) => {
    e.preventDefault();
    
    if (!newReply.content) {
      setError('Reply content is required');
      return;
    }
    
    try {
      const replyData = {
        content: newReply.content,
        messageId: id
      };
      
      // Only add parentReplyId if we're replying to another reply
      if (replyingTo && replyingTo.id) {
        replyData.parentReplyId = replyingTo.id;
        console.log('Setting parentReplyId:', replyingTo.id);
      }
      
      console.log('Sending reply data:', replyData);
      
      // Handle screenshot separately to ensure it's properly sent
      if (screenshot) {
        replyData.screenshot = screenshot;
      }
      
      await replyService.createReply(replyData);
      setNewReply({ content: '', messageId: id });
      setScreenshot(null);
      setShowReplyForm(false);
      setReplyingTo(null);
      fetchMessageAndReplies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reply');
    }
  };

  const handleScreenshotChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleReplyToReply = (reply) => {
    console.log('Replying to reply:', reply);
    
    // Ensure the reply has a valid ID
    if (!reply || !reply.id) {
      console.error('Invalid reply object:', reply);
      setError('Cannot reply to this comment. Missing ID.');
      return;
    }
    
    console.log('Reply ID:', reply.id);
    setReplyingTo({
      id: reply.id,
      author: reply.author
    });
    setShowReplyForm(true);
    window.scrollTo(0, document.body.scrollHeight);
  };

  const handleRate = async (type, id, value) => {
    try {
      if (type === 'message') {
        await messageService.rateMessage(id, value);
      } else {
        await replyService.rateReply(id, value);
      }
      fetchMessageAndReplies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rate');
    }
  };

  if (loading) {
    return <div>Loading message...</div>;
  }

  if (!message) {
    return <div>Message not found</div>;
  }

  return (
    <div className="message-view-page">
      <div className="page-header">
        <Link to={`/channels/${message.channelId}`}>Back to Channel</Link>
        <h1>{message.title}</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Message */}
      <div className="message-card card">
        <div className="card-header">
          <div className="message-meta">
            <span>By: {message.author?.username || 'Deleted User'}</span>
            <span>Level: {message.author?.level || 'Deleted User'}</span>
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
            <div className="screenshot-container">
              <img 
                src={typeof message.screenshot === 'string' 
                  ? (message.screenshot.startsWith('http') 
                    ? message.screenshot 
                    : `${API_BASE_URL}${message.screenshot}`) 
                  : URL.createObjectURL(message.screenshot)} 
                alt="Screenshot" 
                className="screenshot" 
              />
            </div>
          )}
          
          {currentUser && (
            <div className="rating-buttons">
              <button 
                className="btn btn-sm" 
                onClick={() => handleRate('message', message.id, 1)}
              >
                👍
              </button>
              <span className="rating-count">{message.totalRating || 0}</span>
              <button 
                className="btn btn-sm" 
                onClick={() => handleRate('message', message.id, -1)}
              >
                👎
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      <div className="replies-section">
        <div className="replies-header">
          <h2>Replies ({replies.length})</h2>
          {currentUser && (
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setShowReplyForm(!showReplyForm);
                setReplyingTo(null);
              }}
            >
              {showReplyForm ? 'Cancel' : 'Add Reply'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="card">
            <div className="card-header">
              <h3>
                {replyingTo 
                  ? `Reply to ${replyingTo.author?.username || 'Deleted User'}'s comment` 
                  : 'Add a Reply'}
              </h3>
              {replyingTo && (
                <button 
                  className="btn btn-sm" 
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel Reply
                </button>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateReply}>
                <div className="form-group">
                  <label htmlFor="content">Your Reply</label>
                  <textarea
                    id="content"
                    className="form-control"
                    rows="3"
                    value={newReply.content}
                    onChange={(e) => setNewReply({...newReply, content: e.target.value})}
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
                
                <button type="submit" className="btn btn-primary">Post Reply</button>
              </form>
            </div>
          </div>
        )}

        {/* Replies List */}
        <div className="replies-list">
          {replies.length === 0 ? (
            <p>No replies yet. Be the first to reply!</p>
          ) : (
            <RenderRepliesTree replies={replies} currentUser={currentUser} handleRate={handleRate} handleReplyToReply={handleReplyToReply} />
          )}
        </div>
      </div>
    </div>
  );
};

// Component to render the full replies tree recursively
const RenderRepliesTree = ({
  replies,
  currentUser,
  handleRate,
  handleReplyToReply,
  level = 0  //  Add level to control indentation
}) => {
  console.log(`RenderRepliesTree called at level ${level} with ${replies ? replies.length : 0} replies`);
  console.log('Replies data:', JSON.stringify(replies, null, 2));
  
  if (!replies || !Array.isArray(replies) || replies.length === 0) {
    console.log(`No replies to render at level ${level}`);
    return null;
  }

  return (
    <>
      {replies.map(reply => {
        if (!reply || !reply.id) {
          console.warn('Invalid reply object:', reply);
          return null;
        }

        console.log(`Rendering reply ${reply.id} at level ${level}`);
        console.log(`Reply ${reply.id} has ${reply.childReplies?.length || 0} child replies`);
        
        if (reply.childReplies && reply.childReplies.length > 0) {
          console.log(`Child replies for ${reply.id}:`, reply.childReplies.map(r => r.id));
        }

        return (
          <div
            key={reply.id}
            className="reply card"
            style={{ marginLeft: `${level * 20}px` }}  //  Indent based on depth
          >
            <div className="card-body">
              <div className="reply-meta">
                <span>By: {reply.author?.username || 'Deleted User'}</span>
                <span>Level: {reply.author?.level || 'Deleted User'}</span>
                {reply.createdAt && (
                  <span>Posted: {getRelativeTime(reply.createdAt)}</span>
                )}
              </div>

              <p>{reply.content}</p>

              {reply.screenshot && (
                <div className="screenshot-container">
                  <img
                    src={
                      typeof reply.screenshot === 'string'
                        ? (reply.screenshot.startsWith('http')
                          ? reply.screenshot
                          : `${API_BASE_URL}${reply.screenshot}`)
                        : URL.createObjectURL(reply.screenshot)
                    }
                    alt="Screenshot"
                    className="screenshot"
                  />
                </div>
              )}

              <div className="reply-actions">
                {currentUser && (
                  <>
                    <div className="rating-buttons">
                      <button className="btn btn-sm" onClick={() => handleRate('reply', reply.id, 1)}>👍</button>
                      <span className="rating-count">{reply.totalRating || 0}</span>
                      <button className="btn btn-sm" onClick={() => handleRate('reply', reply.id, -1)}>👎</button>
                    </div>
                    <button className="btn btn-sm" onClick={() => handleReplyToReply(reply)}>Reply</button>
                  </>
                )}
              </div>

              {Array.isArray(reply.childReplies) && reply.childReplies.length > 0 && (
                <div className="nested-replies">
                  <p className="nested-replies-header">Replies:</p>
                  <RenderRepliesTree
                    replies={reply.childReplies}
                    currentUser={currentUser}
                    handleRate={handleRate}
                    handleReplyToReply={handleReplyToReply}
                    level={level + 1}  //  Increment nesting
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};


export default MessageView; 