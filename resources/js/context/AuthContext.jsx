import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('palayoffs_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('palayoffs_auth_token') || null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        // If it's a demo admin session, retain it locally
        if (token.startsWith('demo-admin-token-')) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/auth/me');
            if (res.data.success && res.data.user) {
                setUser(res.data.user);
                localStorage.setItem('palayoffs_user', JSON.stringify(res.data.user));
            }
        } catch {
            // Keep existing saved user if valid, only clear if explicitly unauthenticated without saved user
            const saved = localStorage.getItem('palayoffs_user');
            if (!saved) {
                setUser(null);
                setToken(null);
                localStorage.removeItem('palayoffs_auth_token');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                const { token: newToken, user: userData } = res.data;
                setToken(newToken);
                setUser(userData);
                localStorage.setItem('palayoffs_auth_token', newToken);
                localStorage.setItem('palayoffs_user', JSON.stringify(userData));
                setLoginModalOpen(false);
                return userData;
            }
            throw new Error(res.data.message || 'Login failed');
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || 'Login failed');
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/auth/logout');
            }
        } catch {
            // ignore network logout errors
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('palayoffs_auth_token');
            localStorage.removeItem('palayoffs_user');
        }
    };

    const isAdmin = Boolean(user && user.role === 'admin');
    const isReferee = false; // Consolidated into admin

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAdmin,
                isReferee,
                login,
                logout,
                refreshUser,
                loginModalOpen,
                setLoginModalOpen,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
