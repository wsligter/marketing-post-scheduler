import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { PostsList } from '../components/posts';
import CreateItemForm from '../components/create/CreateItemForm';
import AIPanel from '../components/create/AIPanel';
import '../styles/posts.css';

const PostSchedulerPage = () => {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [setCreateFormContent, setSetCreateFormContent] = useState(null);

  // Fetch posts, campaigns, and users when component mounts
  useEffect(() => {
    fetchPosts();
    fetchCampaigns();
    fetchUsers();
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
      
      // Filter posts based on selected filters
      console.log('Filtering posts by campaign:', selectedCampaign, 'and assignee:', selectedAssignee);
      filterPosts(sortedPosts, selectedCampaign, selectedAssignee);
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
      console.log('Fetching campaigns...');
      
      const response = await api.get('/api/campaigns');
      console.log('Campaigns API response:', response);
      
      // Ensure we have an array of campaigns
      const campaignsArray = Array.isArray(response.data) ? response.data : [];
      console.log('Campaigns array length:', campaignsArray.length);
      
      setCampaigns(campaignsArray);
      setLoadingCampaigns(false);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Error status:', err.response ? err.response.status : 'No status');
      
      setCampaigns([]);
      setLoadingCampaigns(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('Fetching users for filter...');
      
      const response = await api.get('/api/users/for-assignment');
      console.log('Users API response:', response);
      
      // Ensure we have an array of users
      const usersArray = Array.isArray(response.data) ? response.data : [];
      console.log('Users array length:', usersArray.length);
      
      setUsers(usersArray);
      setLoadingUsers(false);
    } catch (err) {
      console.error('Error fetching users for filter:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Error status:', err.response ? err.response.status : 'No status');
      
      setUsers([]);
      setLoadingUsers(false);
    }
  };
  
  const filterPosts = (postsToFilter, campaignId, assigneeId) => {
    let filtered = postsToFilter;
    
    // Filter by campaign
    if (campaignId !== 'all') {
      filtered = filtered.filter(post => 
        post.campaign && post.campaign._id === campaignId
      );
    }
    
    // Filter by assignee
    if (assigneeId !== 'all') {
      filtered = filtered.filter(post => 
        post.assignedUser && post.assignedUser._id === assigneeId
      );
    }
    
    setPosts(filtered);
  };
  
  const handleCampaignFilterChange = (e) => {
    const campaignId = e.target.value;
    setSelectedCampaign(campaignId);
    filterPosts(allPosts, campaignId, selectedAssignee);
  };
  
  const handleAssigneeFilterChange = (e) => {
    const assigneeId = e.target.value;
    setSelectedAssignee(assigneeId);
    filterPosts(allPosts, selectedCampaign, assigneeId);
  };

  const handlePostCreated = (newPost) => {
    // Add the new post to allPosts and sort by scheduledDate
    const updatedAllPosts = [...allPosts, newPost].sort((a, b) => 
      new Date(a.scheduledDate) - new Date(b.scheduledDate)
    );
    setAllPosts(updatedAllPosts);
    
    // Apply the current filter
    filterPosts(updatedAllPosts, selectedCampaign, selectedAssignee);
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
    filterPosts(updatedAllPosts, selectedCampaign, selectedAssignee);
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
    filterPosts(updatedAllPosts, selectedCampaign, selectedAssignee);
  };

  return (
    <div className="social-media-scheduler page-container">
      <div className="scheduler-container">
        <div className="form-section">
          <CreateItemForm 
            editingPost={editingPost}
            onCreated={handlePostCreated}
            onUpdated={(post) => handlePostUpdated(post)}
            onCancelled={() => setEditingPost(null)}
            onDeleted={(id) => handleDeletePost(id)}
            onRequestAIPanelToggle={() => setShowAIPanel((v) => !v)}
            registerSetContent={(fn) => setSetCreateFormContent(() => fn)}
          />
        </div>
        
        <div className="posts-section">
          <AIPanel 
            visible={showAIPanel}
            onClose={() => setShowAIPanel(false)}
            onUseContent={(text) => {
              if (setCreateFormContent) setCreateFormContent(text);
              setShowAIPanel(false);
            }}
          />
          <PostsList 
            posts={posts} 
            loading={loading} 
            error={error}
            onEditPost={handleEditPost}
            // Filter props
            campaigns={campaigns}
            users={users}
            selectedCampaign={selectedCampaign}
            selectedAssignee={selectedAssignee}
            onCampaignFilterChange={handleCampaignFilterChange}
            onAssigneeFilterChange={handleAssigneeFilterChange}
            loadingCampaigns={loadingCampaigns}
            loadingUsers={loadingUsers}
          />
        </div>
      </div>
    </div>
  );
};

export default PostSchedulerPage;
