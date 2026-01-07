import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, HelpCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const UserAvatar = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { logout } = useAuth()
    const navigate = useNavigate()

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const handleLogout = () => {
        logout()
        setIsOpen(false)
    }

    const menuItems = [
        {
            label: 'Profile',
            icon: User,
            onClick: () => {
                navigate('/profile')
                setIsOpen(false)
            }
        },
        {
            label: 'Settings',
            icon: Settings,
            onClick: () => {
                // Could navigate to settings page
                setIsOpen(false)
            }
        },
        {
            label: 'Help & Support',
            icon: HelpCircle,
            onClick: () => {
                window.open('https://docs.vetricix.com', '_blank')
                setIsOpen(false)
            }
        },
        {
            label: 'Logout',
            icon: LogOut,
            onClick: handleLogout,
            className: 'text-red-600 dark:text-red-400'
        }
    ]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {user?.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(user?.name)}
                    </div>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="px-3 py-2">
                                <p className="font-medium truncate">{user?.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="p-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${item.className || ''}`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default UserAvatar
