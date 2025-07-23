import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [userPosts, setUserPosts] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingPost, setUpcomingPost] = useState(null);
  const [hasNoPosts, setHasNoPosts] = useState(false);

  const fetchUserPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setHasNoPosts(false);
      
      const response = await api.get('/api/posts');
      const allPosts = response.data;
      
      // Filter posts assigned to user and posts to review (exclude published posts from dashboard)
      const assignedPosts = allPosts.filter(post => 
        post.assignedUser && post.assignedUser._id === user._id && post.publishStatus !== 'published'
      );
      const postsToReview = allPosts.filter(post => 
        post.reviewer && post.reviewer._id === user._id && post.publishStatus !== 'published'
      );
      
      // Sort by scheduled date
      const sortedPosts = assignedPosts.sort((a, b) => 
        new Date(a.scheduledDate) - new Date(b.scheduledDate)
      );
      
      setUserPosts(sortedPosts);
      
      // Sort review posts by scheduled date
      const sortedReviewPosts = postsToReview.sort((a, b) => 
        new Date(a.scheduledDate) - new Date(b.scheduledDate)
      );
      
      // Create unified list of all posts (assigned + review) sorted by due date
      // Use a Map to deduplicate posts where user is both owner and reviewer
      const postMap = new Map();
      
      // Add assigned posts first
      sortedPosts.forEach(post => {
        postMap.set(post._id, post);
      });
      
      // Add review posts, but don't duplicate if already exists
      sortedReviewPosts.forEach(post => {
        if (!postMap.has(post._id)) {
          postMap.set(post._id, post);
        }
      });
      
      // Convert back to array and sort by due date
      const unifiedPosts = Array.from(postMap.values()).sort((a, b) => 
        new Date(a.scheduledDate) - new Date(b.scheduledDate)
      );
      setUserPosts(unifiedPosts);
      
      // Check if user has no posts
      if (sortedPosts.length === 0) {
        setHasNoPosts(true);
      }
      
      // Find next upcoming post (within 1 week)
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextPost = sortedPosts.find(post => {
        const postDate = new Date(post.scheduledDate);
        return postDate > now && postDate <= oneWeekFromNow;
      });
      
      setUpcomingPost(nextPost);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Failed to load your posts');
      setHasNoPosts(false);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // const formatTime = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleTimeString('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  // Helper function to get due date badge
  const getDueDateBadge = (scheduledDate) => {
    const now = new Date();
    const postDate = new Date(scheduledDate);
    const diffTime = postDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: 'Today', class: 'due-today' };
    if (diffDays === 1) return { text: 'Tomorrow', class: 'due-tomorrow' };
    if (diffDays === 2) return { text: '2 days', class: 'due-2days' };
    if (diffDays === 3) return { text: '3 days', class: 'due-3days' };
    return null;
  };

  const updateReviewStatus = async (postId, status) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [postId]: true }));
      await api.patch(`/api/posts/${postId}/review-status`, { reviewStatus: status });
      // Refresh posts after update
      fetchUserPosts();
    } catch (error) {
      console.error('Error updating review status:', error);
      setError('Failed to update review status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [postId]: false }));
    }
  };

  const updatePublishStatus = async (postId, status) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [postId]: true }));
      await api.patch(`/api/posts/${postId}/publish-status`, { publishStatus: status });
      // Refresh posts after update
      fetchUserPosts();
    } catch (error) {
      console.error('Error updating publish status:', error);
      setError('Failed to update publish status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [postId]: false }));
    }
  };

  const getWeekDays = (startDate) => {
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getThisWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const getNextWeekStart = () => {
    const thisWeekStart = getThisWeekStart();
    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);
    return nextWeekStart;
  };

  const getPostsForDate = (date) => {
    const dateString = date.toDateString();
    return userPosts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === dateString;
    });
  };

  const thisWeekDays = getWeekDays(getThisWeekStart());
  const nextWeekDays = getWeekDays(getNextWeekStart());

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.firstName}!</p>
      </div>

      {/* Notification Bar */}
      {upcomingPost && (
        <div className="notification-bar">
          <div className="notification-content">
            <span className="notification-icon">🔔</span>
            <div className="notification-text">
              <strong>Upcoming Post:</strong> "{upcomingPost.content.substring(0, 50)}..." 
              scheduled for {formatDate(upcomingPost.scheduledDate)} {/* at {formatTime(upcomingPost.scheduledDate)} */}
            </div>
          </div>
        </div>
      )}

      {/* No Posts Notification */}
      {hasNoPosts && (
        <div className="notification-bar no-posts-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <div className="notification-text">
              <strong>You have no scheduled posts.</strong>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="notification-bar error-notification">
          <div className="notification-content">
            <span className="notification-icon">❌</span>
            <div className="notification-text">
              <strong>{error}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* Calendar Section */}
        <div className="calendar-section">
          <h2>Calendar View</h2>
          
          {/* This Week */}
          <div className="week-section">
            <h3>This Week</h3>
            <div className="week-list">
              {thisWeekDays.map((day, index) => {
                const postsForDay = getPostsForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className={`day-item ${isToday ? 'today' : ''}`}>
                    <div className="day-header">
                      <span className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="day-date">{day.getDate()}</span>
                    </div>
                    <div className="day-posts">
                      {postsForDay.length > 0 ? (
                        postsForDay.map(post => (
                          <div key={post._id} className="day-post">
                            {/* <span className="post-time">{formatTime(post.scheduledDate)}</span> */}
                            <span className="post-preview">{post.content.substring(0, 30)}...</span>
                          </div>
                        ))
                      ) : (
                        <span className="no-posts">No posts</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Week */}
          <div className="week-section">
            <h3>Next Week</h3>
            <div className="week-list">
              {nextWeekDays.map((day, index) => {
                const postsForDay = getPostsForDate(day);
                
                return (
                  <div key={index} className="day-item">
                    <div className="day-header">
                      <span className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="day-date">{day.getDate()}</span>
                    </div>
                    <div className="day-posts">
                      {postsForDay.length > 0 ? (
                        postsForDay.map(post => (
                          <div key={post._id} className="day-post">
                            {/* <span className="post-time">{formatTime(post.scheduledDate)}</span> */}
                            <span className="post-preview">{post.content.substring(0, 30)}...</span>
                          </div>
                        ))
                      ) : (
                        <span className="no-posts">No posts</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Unified Posts Section */}
        <div className="my-posts-section">
          <h2>My Posts & Reviews</h2>
          {userPosts.length > 0 ? (
            <div className="posts-list">
              {userPosts.slice(0, 10).map(post => {
                const dueBadge = getDueDateBadge(post.scheduledDate);
                const isReviewPost = post.reviewer && post.reviewer._id === user._id;
                const isAssignedPost = post.assignedUser && post.assignedUser._id === user._id;
                const isBothReviewerAndOwner = isReviewPost && isAssignedPost;
                
                return (
                  <div key={post._id} className={`post-item ${isReviewPost ? 'review-post' : ''}`}>
                    <div className="post-content-preview">
                      {post.content.substring(0, 100)}...
                    </div>
                    <div className="post-details">
                      <span className="post-date">{formatDate(post.scheduledDate)}</span>
                      
                      {/* Due date tab - for assigned posts or when user is both */}
                      {dueBadge && (isAssignedPost || isBothReviewerAndOwner) && (
                        <span className={`due-tab ${dueBadge.class}`}>
                          {dueBadge.text}
                        </span>
                      )}
                      
                      {/* Review badge for posts user needs to review (but not if they're also the owner) */}
                      {isReviewPost && !isBothReviewerAndOwner && (
                        <span className="review-badge">Review Required</span>
                      )}
                      
                      {/* Special badge when user is both reviewer and owner */}
                      {isBothReviewerAndOwner && (
                        <span className="both-badge">Owner & Reviewer</span>
                      )}
                      
                      {/* Ready to post badge - for assigned posts that are reviewed */}
                      {isAssignedPost && post.reviewStatus === 'reviewed' && post.publishStatus === 'scheduled' && (
                        <span className="ready-badge">Ready to Post</span>
                      )}
                      
                      {/* Campaign badge */}
                      {post.campaign && (
                        <span className="campaign-badge">{post.campaign.name}</span>
                      )}
                      
                      {/* Show assigned user info for review posts (but not if user is both) */}
                      {isReviewPost && !isBothReviewerAndOwner && post.assignedUser && (
                        <span className="assigned-user-badge">
                          Assigned to: {post.assignedUser.firstName} {post.assignedUser.lastName}
                        </span>
                      )}
                      
                      {/* Show reviewer info for assigned posts (but not if user is both) */}
                      {isAssignedPost && !isBothReviewerAndOwner && post.reviewer && (
                        <span className="reviewer-badge">
                          Reviewer: {post.reviewer.firstName} {post.reviewer.lastName}
                        </span>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="post-actions">
                      {/* Review action - for reviewers */}
                      {isReviewPost && post.reviewStatus === 'pending' && (
                        <button 
                          className="action-btn review-btn"
                          onClick={() => updateReviewStatus(post._id, 'reviewed')}
                          disabled={updatingStatus[post._id]}
                        >
                          {updatingStatus[post._id] ? 'Updating...' : 'Mark as Reviewed'}
                        </button>
                      )}
                      
                      {/* Publish action - for owners of reviewed posts */}
                      {isAssignedPost && post.reviewStatus === 'reviewed' && post.publishStatus === 'scheduled' && (
                        <button 
                          className="action-btn publish-btn"
                          onClick={() => updatePublishStatus(post._id, 'published')}
                          disabled={updatingStatus[post._id]}
                        >
                          {updatingStatus[post._id] ? 'Publishing...' : 'Mark as Published'}
                        </button>
                      )}
                      
                      {/* Publish action - for owners without reviewer */}
                      {isAssignedPost && !post.reviewer && post.publishStatus === 'scheduled' && (
                        <button 
                          className="action-btn publish-btn"
                          onClick={() => updatePublishStatus(post._id, 'published')}
                          disabled={updatingStatus[post._id]}
                        >
                          {updatingStatus[post._id] ? 'Publishing...' : 'Mark as Published'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {userPosts.length > 10 && (
                <div className="more-posts">
                  ...and {userPosts.length - 10} more posts
                </div>
              )}
            </div>
          ) : (
            <div className="no-posts-message">
              <p>You don't have any scheduled posts yet.</p>
              <p>Visit the Post Scheduler to create your first post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
