import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/calendar.css';
import { Modal } from '../common';
import config from '../../config';

const CalendarView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/posts');
        
        // Add defensive check to ensure posts is always an array
        if (Array.isArray(response.data)) {
          const postsArray = response.data;
          // Ensure we have an array of posts
          // Sort posts by scheduledDate (ascending order - earliest first)
          const sortedPosts = postsArray.sort((a, b) => 
            new Date(a.scheduledDate) - new Date(b.scheduledDate)
          );
          setPosts(sortedPosts);
        } else {
          console.error('Expected posts data to be an array but got:', typeof response.data);
          setPosts([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Group posts by date
  const postsByDate = posts.reduce((acc, post) => {
    const date = new Date(post.scheduledDate);
    date.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const dateStr = date.toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    
    acc[dateStr].push(post);
    return acc;
  }, {});



  // Handle post click
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // Get the current month and year for the calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Function to render custom day contents in the calendar
  const renderDayContents = (day, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const postsOnDate = postsByDate[dateStr] || [];
    
    return (
      <div className="calendar-day-contents">
        <span className="day-number">{day}</span>
        {postsOnDate.length > 0 && (
          <div className="calendar-posts-indicator">
            {postsOnDate.map((post, index) => (
              <div 
                key={post._id} 
                className={`calendar-post-item ${post.campaign ? 'campaign-post' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick(post);
                }}
                title={post.campaign ? `Campaign: ${post.campaign.name}` : 'No campaign'}
              >
                {post.content.length > 20 ? `${post.content.substring(0, 20)}...` : post.content}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="calendar-view-container">
      {loading ? (
        <div className="loading">Loading calendar data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="calendar-wrapper">
          <DatePicker
            selected={currentMonth}
            onChange={date => setCurrentMonth(date)}
            inline
            renderDayContents={renderDayContents}
            showMonthYearPicker={false}
            showFullMonthYearPicker={true}
            showFourColumnMonthYearPicker={false}
            calendarClassName="marketing-calendar"
            dayClassName={date => {
              const dateStr = date.toISOString().split('T')[0];
              const postsOnDate = postsByDate[dateStr] || [];
              const day = date.getDay();
              const isWeekend = day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
              
              // Build class names array
              const classNames = [];
              
              // Add weekend class if it's a weekend day
              if (isWeekend) {
                classNames.push('weekend-day');
              }
              
              // Add post-related classes
              if (postsOnDate.length > 0) {
                // Check if any post has a campaign
                const hasCampaign = postsOnDate.some(post => post.campaign);
                classNames.push(hasCampaign ? 'has-campaign-posts' : 'has-posts');
              }
              
              return classNames.join(' ');
            }}
            monthsShown={1}
          />
        </div>
      )}
      
      {showPostModal && selectedPost && (
        <Modal 
          title="Post Details"
          onClose={() => setShowPostModal(false)}
        >
          <div className="post-modal-content">
            <div className="post-content">
              <p>{selectedPost.content}</p>
            </div>
            
            {selectedPost.imageUrl && (
              <div className="post-image-container">
                <img 
                  src={selectedPost.imageUrl.startsWith('http') 
                    ? selectedPost.imageUrl 
                    : `${config.apiUrl}${selectedPost.imageUrl}`
                  } 
                  alt="Post" 
                  className="post-image"
                />
              </div>
            )}
            
            <div className="post-details">
              <div className="post-date">
                <strong>Scheduled for:</strong> {new Date(selectedPost.scheduledDate).toLocaleDateString()}
              </div>
              
              {selectedPost.campaign && (
                <div className="post-campaign">
                  <strong>Campaign:</strong> {selectedPost.campaign.name}
                </div>
              )}
              
              <div className="post-status">
                <strong>Status:</strong> 
                <span className={`status-badge ${selectedPost.status.toLowerCase()}`}>
                  {selectedPost.status}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarView;
