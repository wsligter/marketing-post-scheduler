import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { PostForm, PostsList } from '../components/posts';
import '../styles/posts.css';

const PostSchedulerPage = () => {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Fetch posts and campaigns when component mounts
  useEffect(() => {
    fetchPosts();
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts...');
      console.log('Auth token:', localStorage.getItem('token'));
      
      const response = await api.get('/api/posts');
      
      console.log('Posts API response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Ensure we have an array of posts
      const postsArray = Array.isArray(response.data) ? response.data : [];
      console.log('Posts array length:', postsArray.length);
      
      // Sort posts by scheduledDate (ascending order - earliest first)
      const sortedPosts = postsArray.sort((a, b) => 
        new Date(a.scheduledDate) - new Date(b.scheduledDate)
      );
      console.log('Sorted posts:', sortedPosts);
      
      setAllPosts(sortedPosts);
      
      // Filter posts based on selected campaign
      console.log('Filtering posts by campaign:', selectedCampaign);
      filterPosts(sortedPosts, selectedCampaign);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Error status:', err.response ? err.response.status : 'No status');
      
      setError('Failed to load posts. Please try again later.');
      setAllPosts([]);
      setPosts([]);
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      console.log('Fetching campaigns for post scheduler...');
      console.log('Auth token:', localStorage.getItem('token'));
      
      const response = await api.get('/api/campaigns');
      
      console.log('Campaigns API response in post scheduler:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Ensure we have an array of campaigns
      const campaignsArray = Array.isArray(response.data) ? response.data : [];
      console.log('Campaigns array length:', campaignsArray.length);
      
      setCampaigns(campaignsArray);
      setLoadingCampaigns(false);
    } catch (err) {
      console.error('Error fetching campaigns for post scheduler:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Error status:', err.response ? err.response.status : 'No status');
      
      setCampaigns([]);
      setLoadingCampaigns(false);
    }
  };
  
  const filterPosts = (postsToFilter, campaignId) => {
    if (campaignId === 'all') {
      setPosts(postsToFilter);
    } else {
      const filtered = postsToFilter.filter(post => 
        post.campaign && post.campaign._id === campaignId
      );
      setPosts(filtered);
    }
  };
  
  const handleCampaignFilterChange = (e) => {
    const campaignId = e.target.value;
    setSelectedCampaign(campaignId);
    filterPosts(allPosts, campaignId);
  };

  const handlePostCreated = (newPost) => {
    // Add the new post to allPosts and sort by scheduledDate
    const updatedAllPosts = [...allPosts, newPost].sort((a, b) => 
      new Date(a.scheduledDate) - new Date(b.scheduledDate)
    );
    setAllPosts(updatedAllPosts);
    
    // Apply the current filter
    filterPosts(updatedAllPosts, selectedCampaign);
  };
  
  const handlePostUpdated = (updatedPost) => {
    // Replace the old post with the updated one in allPosts and sort
    const updatedAllPosts = allPosts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ).sort((a, b) => 
      new Date(a.scheduledDate) - new Date(b.scheduledDate)
    );
    setAllPosts(updatedAllPosts);
    
    // Apply the current filter
    filterPosts(updatedAllPosts, selectedCampaign);
  };
  
  const handleEditPost = (post) => {
    // Set the post to be edited
    setEditingPost(post);
    
    // Scroll to the form
    document.querySelector('.post-form-container').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  const handleDeletePost = (postId) => {
    // Remove the deleted post from allPosts
    const updatedAllPosts = allPosts.filter(post => post._id !== postId);
    setAllPosts(updatedAllPosts);
    
    // Apply the current filter
    filterPosts(updatedAllPosts, selectedCampaign);
  };

  return (
    <div className="social-media-scheduler">
      <div className="scheduler-container">
        <div className="form-section">
          <PostForm 
            onPostCreated={handlePostCreated}
            onPostUpdated={handlePostUpdated}
            editingPost={editingPost}
            setEditingPost={setEditingPost}
            onDeletePost={handleDeletePost}
          />
        </div>
        
        <div className="posts-section">
          <div className="filter-container">
            <label htmlFor="campaign-filter">Filter by Campaign:</label>
            <select
              id="campaign-filter"
              value={selectedCampaign}
              onChange={handleCampaignFilterChange}
              className="campaign-filter-select"
              disabled={loadingCampaigns}
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          
          <PostsList 
            posts={posts} 
            loading={loading} 
            error={error}
            onEditPost={handleEditPost}
          />
        </div>
      </div>
    </div>
  );
};

export default PostSchedulerPage;
