import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { API_URL } from '../services/api'
const AuthContext = createContext(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        name: 'Guest User',
        email: 'guest@example.com',
        avatar_url: '',
        theme_preference: 'default',
        dark_mode: false,
        isGuest: true
    })
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    // Initialize axios with auth token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            fetchUser()
        } else {
            // Stay as guest
            setIsLoading(false)
        }
    }, [token])

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`)
            setUser(response.data)
        } catch (error) {
            console.error('Failed to fetch user:', error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email, password) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('username', email)
            formData.append('password', password)

            const response = await axios.post(`${API_URL}/auth/login`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            const { access_token, user } = response.data
            localStorage.setItem('token', access_token)
            setToken(access_token)
            setUser(user)
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        } catch (error) {
            console.error('Login error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (email, password, name) => {
        setIsLoading(true)
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                email,
                password,
                name
            })

            const { access_token, user } = response.data
            localStorage.setItem('token', access_token)
            setToken(access_token)
            setUser(user)
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        } catch (error) {
            console.error('Registration error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser({
            name: 'Guest User',
            email: 'guest@example.com',
            avatar_url: '',
            theme_preference: 'default',
            dark_mode: false,
            isGuest: true
        })
        delete axios.defaults.headers.common['Authorization']
        navigate('/')
    }

    const updateUser = (updates) => {
        setUser(prev => prev ? { ...prev, ...updates } : null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            register,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}
