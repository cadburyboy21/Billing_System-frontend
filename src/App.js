import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MenuDisplay from './components/MenuDisplay';
import Cart from './components/Cart';
import Billing from './components/Billing';
import MenuManagement from './components/MenuManagement';
import SalesReport from './components/SalesReport';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const updateCartItem = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (menuItemId) => {
    setCart(prevCart => prevCart.filter(item => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="container">
            <Link to="/" className="logo">🍽️ Restaurant Billing</Link>
            <div className="nav-links">
              <Link to="/">Menu</Link>
              <Link to="/menu-management">Manage Menu</Link>
              <Link to="/sales-report">Sales Report</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div className="main-content">
                <MenuDisplay addToCart={addToCart} />
                <Cart
                  cart={cart}
                  updateCartItem={updateCartItem}
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  calculateTotal={calculateTotal}
                />
              </div>
            }
          />
          <Route
            path="/billing/:orderId"
            element={<Billing clearCart={clearCart} />}
          />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/sales-report" element={<SalesReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

