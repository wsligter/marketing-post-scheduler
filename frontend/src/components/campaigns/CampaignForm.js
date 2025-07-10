import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Modal } from '../common';
// Using consolidated campaigns.css from styles directory

const CampaignForm = ({ onCampaignCreated, onCampaignUpdated, editingCampaign, setEditingCampaign, onDeleteCampaign }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset form when not editing or update form when editing
  useEffect(() => {
    if (editingCampaign) {
      setFormData({
        name: editingCampaign.name || '',
        status: editingCampaign.status || 'draft'
      });
    } else {
      setFormData({
        name: '',
        status: 'draft'
      });
    }
  }, [editingCampaign]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      setError('Campaign name is required');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting campaign form...', formData);
      console.log('Auth token:', localStorage.getItem('token'));
      
      let response;

      if (editingCampaign) {
        // Update existing campaign
        console.log('Updating existing campaign:', editingCampaign._id);
        response = await api.put(
          `/api/campaigns/${editingCampaign._id}`, 
          formData
        );
        console.log('Update campaign response:', response);
        
        if (onCampaignUpdated) {
          onCampaignUpdated(response.data);
        }
        
        setEditingCampaign(null);
      } else {
        // Create new campaign
        console.log('Creating new campaign:', formData);
        response = await api.post('/api/campaigns', formData);
        console.log('Create campaign response:', response);
        
        if (onCampaignCreated) {
          console.log('Calling onCampaignCreated with:', response.data);
          onCampaignCreated(response.data);
        }
      }

      // Reset form
      setFormData({
        name: '',
        status: 'draft'
      });
    } catch (err) {
      console.error('Error saving campaign:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Error status:', err.response ? err.response.status : 'No status');
      
      // More descriptive error message based on the error
      if (err.response && err.response.status === 401) {
        setError('Authentication error. Please log in again.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Error: ${err.response.data.message}`);
      } else {
        setError('Error saving campaign. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      status: 'draft'
    });
  };

  const handleDelete = async () => {
    if (!editingCampaign) return;
    
    try {
      setDeleteLoading(true);
      await api.delete(`/api/campaigns/${editingCampaign._id}`);
      
      if (onDeleteCampaign) {
        onDeleteCampaign(editingCampaign._id);
      }
      
      setShowDeleteModal(false);
      setEditingCampaign(null);
      setFormData({
        name: '',
        status: 'draft'
      });
    } catch (err) {
      setError('Error deleting campaign. Please try again.');
      console.error('Error deleting campaign:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="campaign-form-container">
      <h2 className="heading-primary">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Campaign Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        

        
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        
        <div className="form-buttons">
          {editingCampaign && (
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
          
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
          </button>
          
          {editingCampaign && (
            <button 
              type="button" 
              className="delete-btn" 
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Campaign
            </button>
          )}
        </div>
      </form>
      {showDeleteModal && (
        <Modal 
          title="Confirm Delete"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="delete-confirmation">
            <p>Do you really want to delete the campaign "{editingCampaign?.name}"?</p>
            <p>This action cannot be undone.</p>
            
            <div className="modal-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="delete-btn" 
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Campaign'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CampaignForm;
