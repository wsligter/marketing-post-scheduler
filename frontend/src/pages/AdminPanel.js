import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminPanel.css';
import LoadingSpinner from '../components/common/LoadingSpinner';
import config from '../config';

// API URL from config
const API_URL = config.apiUrl;

// Helper function to format dates in Europe/Amsterdam timezone with DD-MM-YYYY HH:mm format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'N/A';
    
    // Format in Europe/Amsterdam timezone (UTC+2 in summer, UTC+1 in winter)
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Amsterdam'
    };
    
    return new Intl.DateTimeFormat('nl-NL', options).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'view-only',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });
    setSuccessMessage('');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setAddingUser(false);
    setSuccessMessage('');
    setError(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'view-only',
      password: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (editingUser) {
        // Update existing user
        const updateData = { ...formData };
        delete updateData.password; // Remove password from update data
        
        const response = await axios.put(
          `${API_URL}/api/users/${editingUser._id}`,
          updateData
        );
        
        // Update the users list with the updated user
        setUsers(users.map(u => u._id === editingUser._id ? response.data : u));
        setSuccessMessage('User updated successfully');
        setEditingUser(null);
      } else if (addingUser) {
        // Create new user
        const response = await axios.post(
          `${API_URL}/api/users/register`,
          formData
        );
        
        // Add the new user to the list
        setUsers([...users, response.data]);
        setSuccessMessage('User created successfully');
        setAddingUser(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'view-only',
          password: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      
      // Remove the deleted user from the list
      setUsers(users.filter(u => u._id !== userId));
      setSuccessMessage('User deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't allow non-admin users to access this page
  if (currentUser?.role !== 'admin') {
    return (
      <div className="admin-container">
        <div className="admin-panel">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const handleAddUserClick = () => {
    setAddingUser(true);
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'view-only',
      password: ''
    });
    setSuccessMessage('');
    setError(null);
  };

  return (
    <div className="admin-container">
      <div className="admin-panel">
        <h2>Admin Panel - User Management</h2>
        
        {error && <div className="admin-error">{error}</div>}
        {successMessage && <div className="admin-success">{successMessage}</div>}
        
        {editingUser ? (
          <div className="edit-user-form">
            <h3>Edit User: {editingUser.email}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="view-only">View Only</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : addingUser ? (
          <div className="add-user-form">
            <h3>Add New User</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                />
                <small className="form-text">Password must be at least 6 characters</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="view-only">View Only</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="users-header">
              <h3>Users</h3>
              <button className="btn-add" onClick={handleAddUserClick}>
                + Add New User
              </button>
            </div>
            
            {loading && <LoadingSpinner size="medium" text="Loading users..." />}
            
            {!loading && users.length === 0 && (
              <p className="no-users">No users found.</p>
            )}
            
            {!loading && users.length > 0 && (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-edit" 
                              onClick={() => handleEditClick(user)}
                            >
                              Edit
                            </button>
                            {/* Don't allow deleting your own account */}
                            {user._id !== currentUser?._id && (
                              <button 
                                className="btn-delete" 
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
