import React, { useState, useEffect } from 'react';
import { menuAPI } from '../services/api';
import './MenuDisplay.css';

const MenuDisplay = ({ addToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  if (loading) {
    return <div className="menu-display loading">Loading menu...</div>;
  }

  if (error) {
    return <div className="menu-display error">{error}</div>;
  }

  return (
    <div className="menu-display">
      <h2>Menu</h2>
      <div className="menu-grid">
        {menuItems.map(item => (
          <div key={item._id} className="menu-item-card" onClick={() => handleAddToCart(item)}>
            <div className="menu-item-image">
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(item.name);
                }}
              />
            </div>
            <div className="menu-item-info">
              <h3>{item.name}</h3>
              <p className="menu-item-price">₹{item.price.toFixed(2)}</p>
              {item.description && <p className="menu-item-description">{item.description}</p>}
            </div>
            <button className="add-to-cart-btn">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuDisplay;



