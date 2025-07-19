import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [userPosts, setUserPosts] = useState([]);
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
      
      // Filter posts assigned to current user
      const myPosts = allPosts.filter(post => 
        post.assignedUser && post.assignedUser._id === user._id
      );
      
      // Sort by scheduled date
      const sortedPosts = myPosts.sort((a, b) => 
        new Date(a.scheduledDate) - new Date(b.scheduledDate)
      );
      
      setUserPosts(sortedPosts);
      
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
              scheduled for {formatDate(upcomingPost.scheduledDate)} at {formatTime(upcomingPost.scheduledDate)}
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
                            <span className="post-time">{formatTime(post.scheduledDate)}</span>
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
                            <span className="post-time">{formatTime(post.scheduledDate)}</span>
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

        {/* My Posts Section */}
        <div className="my-posts-section">
          <h2>My Scheduled Posts</h2>
          {userPosts.length > 0 ? (
            <div className="posts-list">
              {userPosts.slice(0, 5).map(post => (
                <div key={post._id} className="post-item">
                  <div className="post-content-preview">
                    {post.content.substring(0, 100)}...
                  </div>
                  <div className="post-details">
                    <span className="post-date">{formatDate(post.scheduledDate)}</span>
                    <span className="post-time">{formatTime(post.scheduledDate)}</span>
                    {post.campaign && (
                      <span className="campaign-badge">{post.campaign.name}</span>
                    )}
                  </div>
                </div>
              ))}
              {userPosts.length > 5 && (
                <div className="more-posts">
                  ...and {userPosts.length - 5} more posts
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
