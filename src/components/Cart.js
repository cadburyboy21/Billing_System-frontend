import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './Cart.css';

const Cart = ({ cart, updateCartItem, removeFromCart, clearCart, calculateTotal }) => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setProcessing(true);
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity
        }))
      };

      const response = await orderAPI.create(orderData);
      navigate(`/billing/${response.data._id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>Cart</h2>
        {cart.length > 0 && (
          <button onClick={clearCart} className="clear-cart-btn">
            Clear
          </button>
        )}
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          cart.map(item => (
            <div key={item.menuItemId} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/60x60?text=' + encodeURIComponent(item.name);
                  }}
                />
              </div>
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                <div className="quantity-controls">
                  <button
                    onClick={() => updateCartItem(item.menuItemId, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item.menuItemId, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.menuItemId)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <strong>Total: ₹{total.toFixed(2)}</strong>
          </div>
          <button
            onClick={handleCheckout}
            className="checkout-btn"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;

