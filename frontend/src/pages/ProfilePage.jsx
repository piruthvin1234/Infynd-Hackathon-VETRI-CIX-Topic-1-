import { useState, useRef } from 'react'
import { User, Mail, Camera, Lock, Save, Trash2, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ProfilePage = () => {
    const { user, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const fileInputRef = useRef(null)

    const handleSaveProfile = async () => {
        setIsLoading(true)
        try {
            // API call to update profile
            await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
            updateUser(formData)
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('Image size should be less than 5MB')
            return
        }

        setIsLoading(true)
        try {
            // Mock upload
            const reader = new FileReader()
            reader.onloadend = () => {
                updateUser({ avatar_url: reader.result })
                setIsLoading(false)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Failed to upload avatar:', error)
            setIsLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
            alert('Password changed successfully')
        } catch (error) {
            console.error('Failed to change password:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsLoading(true)
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            alert('Account deletion requested. You will receive a confirmation email.')
            setShowDeleteConfirm(false)
        } catch (error) {
            console.error('Failed to delete account:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left column - Avatar & Actions */}
                <div className="md:col-span-1 space-y-6">
                    {/* Avatar card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                                        {getInitials(user.name)}
                                    </div>
                                )}
                                <button
                                    onClick={handleAvatarClick}
                                    disabled={isLoading}
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <h3 className="text-xl font-semibold">{user.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold mb-4">Account Overview</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Member since</span>
                                <span className="font-medium">Jan 2024</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Companies analyzed</span>
                                <span className="font-medium">127</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Last login</span>
                                <span className="font-medium">Today, 14:30</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Plan</span>
                                <span className="font-medium text-blue-600">Pro</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Forms */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile info card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Personal Information
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Update your personal details
                                </p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false)
                                            setFormData({
                                                name: user.name,
                                                email: user.email,
                                            })
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                        {isLoading ? (
                                            <LoadingSpinner size="sm" className="mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent disabled:opacity-60"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change password card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold flex items-center mb-6">
                            <Lock className="w-5 h-5 mr-2" />
                            Change Password
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Update Password
                            </button>
                        </div>
                    </div>

                    {/* Danger zone */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-red-200 dark:border-red-900">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center mb-6">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Danger Zone
                        </h3>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>

                            {showDeleteConfirm ? (
                                <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                        Are you sure you want to delete your account? This action cannot be undone.
                                    </p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isLoading}
                                            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                                        >
                                            {isLoading ? (
                                                <LoadingSpinner size="sm" className="mr-2" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 mr-2" />
                                            )}
                                            Yes, Delete Account
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-6 py-2 border border-red-600 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
