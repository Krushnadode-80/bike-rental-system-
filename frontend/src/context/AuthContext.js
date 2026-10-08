import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Require a fresh sign-in whenever the frontend starts instead of restoring
  // a previous browser session from persistent storage.
  const [token, setToken] = useState(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch /me info to keep profile updated
  const fetchMe = useCallback(async () => {
    try {
      const res = await client.get('/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      logout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        await fetchMe();
      }
      setLoading(false);
    };
    initializeAuth();
  }, [token, fetchMe]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await client.post('/login', { email, password });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      await fetchMe();
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Login failed';
    }
  };

  // Registration handler
  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await client.post('/register', { name, email, password, role });
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Registration failed';
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Update Profile Info
  const updateProfile = async (profileData) => {
    try {
      const res = await client.post('/user/update-profile', profileData);
      if (token) {
        await fetchMe();
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to update profile';
    }
  };

  // Upload KYC documents (Multipart Form Data)
  const uploadKYC = async (type, file) => {
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('file', file);
      
      const res = await client.post('/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (token) {
        await fetchMe();
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'File upload failed';
    }
  };

  // Send Email OTP
  const sendOTP = async () => {
    try {
      if (!user) throw new Error("No user session active");
      const res = await client.post(`/send-otp?email=${encodeURIComponent(user.email)}`);
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to send OTP';
    }
  };

  // Verify Email OTP
  const verifyOTP = async (otp) => {
    try {
      if (!user) throw new Error("No user session active");
      const res = await client.post(`/verify-otp?email=${encodeURIComponent(user.email)}&otp=${encodeURIComponent(otp)}`);
      if (token) {
        await fetchMe(token);
      }
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to verify OTP';
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    uploadKYC,
    sendOTP,
    verifyOTP,
    refreshUser: () => fetchMe(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
