import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import config from '../../config';
import './PostDetailModal.css';

const PostDetailModal = ({ post, isOpen, onClose, onPostUpdate }) => {
  const { user } = useContext(AuthContext);
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !post) return null;

  const isReviewer = post.reviewer && post.reviewer._id === user._id;
  const isOwner = post.assignedUser && post.assignedUser._id === user._id;
  const canReview = isReviewer && post.reviewStatus === 'pending';
  const canPublish = isOwner && (post.reviewStatus === 'reviewed' || !post.reviewer) && post.publishStatus === 'scheduled';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReviewAction = async (reviewStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/api/posts/${post._id}/review-status`, { reviewStatus });
      onPostUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating review status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePublishAction = async () => {
    try {
      setUpdating(true);
      await api.patch(`/api/posts/${post._id}/publish-status`, { publishStatus: 'published' });
      onPostUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating publish status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = () => {
    if (post.publishStatus === 'published') {
      return <span className="status-badge published">Published</span>;
    }
    
    switch (post.reviewStatus) {
      case 'reviewed':
        return <span className="status-badge reviewed">Reviewed ✓</span>;
      case 'changes_requested':
        return <span className="status-badge changes-requested">Changes Requested</span>;
      default:
        return <span className="status-badge pending">Pending Review</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Post Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="post-status-section">
            {getStatusBadge()}
            <span className="scheduled-date">
              Scheduled: {formatDate(post.scheduledDate)}
            </span>
          </div>

          <div className="post-content-section">
            <h3>Content</h3>
            <div className="post-content">
              {post.content}
            </div>
          </div>

          {post.imageUrl && (
            <div className="post-image-section">
              <h3>Image</h3>
              <img 
                src={post.imageUrl.startsWith('http') ? post.imageUrl : `${config.apiUrl}${post.imageUrl}`}
                alt="Post" 
                className="post-image" 
              />
            </div>
          )}

          <div className="post-meta-section">
            <div className="meta-item">
              <strong>Assigned to:</strong> {post.assignedUser?.firstName} {post.assignedUser?.lastName}
            </div>
            {post.reviewer && (
              <div className="meta-item">
                <strong>Reviewer:</strong> {post.reviewer.firstName} {post.reviewer.lastName}
              </div>
            )}
            {post.campaign && (
              <div className="meta-item">
                <strong>Campaign:</strong> {post.campaign.name}
              </div>
            )}
          </div>

          {/* Review Actions for Reviewers */}
          {canReview && (
            <div className="review-actions-section">
              <h3>Review Actions</h3>
              <div className="review-buttons">
                <button
                  className="review-btn accept-btn"
                  onClick={() => handleReviewAction('reviewed')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : '✓ Accept'}
                </button>
                <button
                  className="review-btn changes-btn"
                  onClick={() => handleReviewAction('changes_requested')}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : '⚠ Request Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Publish Action for Owners */}
          {canPublish && (
            <div className="publish-actions-section">
              <h3>Publish Actions</h3>
              <button
                className="publish-btn"
                onClick={handlePublishAction}
                disabled={updating}
              >
                {updating ? 'Publishing...' : '🚀 Mark as Published'}
              </button>
            </div>
          )}

          {/* Status Messages */}
          {post.reviewStatus === 'changes_requested' && isOwner && (
            <div className="status-message changes-message">
              <strong>⚠ Changes Requested</strong>
              <p>The reviewer has requested changes to this post. Please review and update as needed.</p>
            </div>
          )}

          {post.reviewStatus === 'reviewed' && isOwner && post.publishStatus === 'scheduled' && (
            <div className="status-message ready-message">
              <strong>✓ Ready to Publish</strong>
              <p>This post has been reviewed and approved. You can now mark it as published.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
