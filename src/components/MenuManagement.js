import React, { useState, useEffect } from 'react';
import { menuAPI } from '../services/api';
import './MenuManagement.css';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await menuAPI.update(editingItem._id, formData);
      } else {
        await menuAPI.create(formData);
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      image: item.image,
      description: item.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuAPI.delete(id);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      description: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="menu-management loading">Loading...</div>;
  }

  return (
    <div className="menu-management">
      <div className="menu-management-header">
        <h2>Menu Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="add-btn">
          {showForm ? 'Cancel' : '+ Add New Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="menu-form">
          <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Image URL *</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editingItem ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="menu-items-list">
        <h3>Menu Items ({menuItems.length})</h3>
        <div className="items-grid">
          {menuItems.map(item => (
            <div key={item._id} className="menu-item-card">
              <div className="menu-item-image">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x150?text=' + encodeURIComponent(item.name);
                  }}
                />
              </div>
              <div className="menu-item-info">
                <h4>{item.name}</h4>
                <p className="price">₹{item.price.toFixed(2)}</p>
                {item.description && <p className="description">{item.description}</p>}
              </div>
              <div className="menu-item-actions">
                <button onClick={() => handleEdit(item)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(item._id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;



