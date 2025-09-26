import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// Components
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Context for authentication
const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser({ ...response.data, token });
      })
      .catch(() => {
        // Token is invalid, remove it
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, role } = response.data;
      
      localStorage.setItem('token', access_token);
      
      // Get user info
      const userResponse = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      setUser({ ...userResponse.data, token: access_token, role });
      toast.success("Login successful!");
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || "Login failed");
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await axios.post(`${API}/auth/register`, userData);
      toast.success("Registration successful! Please login.");
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading Vihaan Care Nest...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/customer" 
              element={
                user && user.role === 'customer' ? 
                <CustomerDashboard /> : 
                <Navigate to="/auth" />
              } 
            />
            <Route 
              path="/admin" 
              element={
                user && user.role === 'admin' ? 
                <AdminDashboard /> : 
                <Navigate to="/auth" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthContext.Provider>
  );
}

export { AuthContext };
export default App;