import React from 'react';

const PostsList = ({ 
  posts, 
  loading, 
  error, 
  onEditPost,
  // Filter props
  campaigns,
  users,
  selectedCampaign,
  selectedAssignee,
  onCampaignFilterChange,
  onAssigneeFilterChange,
  loadingCampaigns,
  loadingUsers
}) => {
  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!posts || posts.length === 0) {
    return <div className="no-posts">No scheduled posts yet.</div>;
  }

  // Helper function to format dates - only showing the date (no time)
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="posts-list">
      <h2 className="section-header">Upcoming Publications</h2>
      
      {/* Filter Container */}
      <div className="filter-container">
        <label>Filter:</label>
        <select
          id="campaign-filter"
          value={selectedCampaign}
          onChange={onCampaignFilterChange}
          className="campaign-filter-select"
          disabled={loadingCampaigns}
        >
          <option value="all">Campaign</option>
          {campaigns.map(campaign => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.name}
            </option>
          ))}
        </select>
        <select
          id="assignee-filter"
          value={selectedAssignee}
          onChange={onAssigneeFilterChange}
          className="assignee-filter-select"
          disabled={loadingUsers}
        >
          <option value="all">Assignee</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </div>
      
      <div className="posts-grid">
        {posts.map((post) => (
          <div 
            key={post._id} 
            className="post-card" 
            onClick={() => onEditPost(post)}
          >
            <div className="post-content">{post.content}</div>
            
            {post.imageUrl && (
              <div className="post-image">
                <img 
                  src={post.imageUrl.startsWith('http') ? post.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${post.imageUrl}`} 
                  alt="Post" 
                />
              </div>
            )}
            
            <div className="post-details">
              {post.status !== 'scheduled' && (
                <div className="post-status">
                  <span className={`status-badge ${post.status}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
              )}
              <div className="post-date-campaign">
                <span className="post-date">{formatDate(post.scheduledDate)}</span>
                <div className="badges-container">
                  {post.campaign && (
                    <span className="campaign-badge">
                      {post.campaign.name}
                    </span>
                  )}
                  {post.assignedUser && (
                    <span className="user-badge">
                      👤 {post.assignedUser.firstName} {post.assignedUser.lastName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsList;
