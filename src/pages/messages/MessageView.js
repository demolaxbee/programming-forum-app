import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messageService, replyService } from '../../services/api.service';
import { AuthContext } from '../../services/auth.context';
import { getRelativeTime } from '../../utils/timeUtils';

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
      
      // Fetch message details
      const messageResponse = await messageService.getMessageById(id);
      setMessage(messageResponse.data);
      
      // Fetch replies for this message
      const repliesResponse = await replyService.getRepliesByMessage(id);
      setReplies(repliesResponse.data);
      
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

  const handleCreateReply = async (e) => {
    e.preventDefault();
    
    if (!newReply.content) {
      setError('Reply content is required');
      return;
    }
    
    try {
      const replyData = {
        ...newReply,
        parentReplyId: replyingTo?.id || null,
        screenshot: screenshot
      };
      
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
    setReplyingTo(reply);
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
            <span>By: {message.author?.username || 'Unknown'}</span>
            <span>Level: {message.author?.level || 'Unknown'}</span>
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
              src={message.screenshot} 
              alt="Screenshot" 
              className="screenshot" 
            />
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
                  ? `Reply to ${replyingTo.author?.username}'s comment` 
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
            replies.map((reply) => (
              <div key={reply.id} className="reply card">
                <div className="card-body">
                  <div className="reply-meta">
                    <span>By: {reply.author?.username || 'Unknown'}</span>
                    <span>Level: {reply.author?.level || 'Unknown'}</span>
                    {reply.createdAt && (
                      <span>Posted: {getRelativeTime(reply.createdAt)}</span>
                    )}
                  </div>
                  <p>{reply.content}</p>
                  {reply.screenshot && (
                    <img 
                      src={reply.screenshot} 
                      alt="Screenshot" 
                      className="screenshot" 
                    />
                  )}
                  
                  <div className="reply-actions">
                    {currentUser && (
                      <>
                        <div className="rating-buttons">
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleRate('reply', reply.id, 1)}
                          >
                            👍
                          </button>
                          <span className="rating-count">{reply.totalRating || 0}</span>
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleRate('reply', reply.id, -1)}
                          >
                            👎
                          </button>
                        </div>
                        <button 
                          className="btn btn-sm" 
                          onClick={() => handleReplyToReply(reply)}
                        >
                          Reply
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Child Replies */}
                  {reply.childReplies && reply.childReplies.length > 0 && (
                    <div className="nested-replies">
                      {reply.childReplies.map((childReply) => (
                        <div key={childReply.id} className="nested-reply card">
                          <div className="card-body">
                            <div className="reply-meta">
                              <span>By: {childReply.author?.username || 'Unknown'}</span>
                              <span>Level: {childReply.author?.level || 'Unknown'}</span>
                              {childReply.createdAt && (
                                <span>Posted: {getRelativeTime(childReply.createdAt)}</span>
                              )}
                            </div>
                            <p>{childReply.content}</p>
                            {childReply.screenshot && (
                              <img 
                                src={childReply.screenshot} 
                                alt="Screenshot" 
                                className="screenshot" 
                              />
                            )}
                            
                            {currentUser && (
                              <div className="rating-buttons">
                                <button 
                                  className="btn btn-sm" 
                                  onClick={() => handleRate('reply', childReply.id, 1)}
                                >
                                  👍
                                </button>
                                <span className="rating-count">{childReply.totalRating || 0}</span>
                                <button 
                                  className="btn btn-sm" 
                                  onClick={() => handleRate('reply', childReply.id, -1)}
                                >
                                  👎
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageView; 