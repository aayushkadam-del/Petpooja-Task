import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserForm from "./components/UserForm";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Marketplace from "./components/Marketplace";
import ShoppingCart from "./components/ShoppingCart";
import Checkout from "./components/Checkout";
import Orders from "./components/Orders";
import ManageOrders from "./components/ManageOrders";
import ManageInventory from "./components/ManageInventory";
import AddProduct from "./components/AddProduct";
import Analytics from "./components/Analytics";
import OrderDetails from "./components/OrderDetails";
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserForm />} />
          <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <ShoppingCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/manage-orders" element={<ManageOrders />} />
          <Route path="/manage-inventory" element={<ManageInventory />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
