import { NavLink, useNavigate } from 'react-router-dom'
import { X, Home, Search, Database, Upload, Settings, BarChart3, BookOpen, Users, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { getStats } from '../../services/api'

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const navItems = [
        { to: '/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/analyze', icon: Search, label: 'Analyze' },
        { to: '/batch', icon: Upload, label: 'Batch Mode' },
        { to: '/library', icon: Database, label: 'Company Library' },
        { to: '/reports', icon: FileText, label: 'Reports' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/team', icon: Users, label: 'Team' },
        { to: '/docs', icon: BookOpen, label: 'Documentation' },
    ]

    const [stats, setStats] = useState({
        totalCompanies: 0,
        processedToday: 0,
        successRate: 0
    })

    const fetchStats = async () => {
        try {
            const data = await getStats()
            setStats(data)
        } catch (error) {
            console.error("Sidebar Stats Error:", error)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-in-out z-50 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div
                    onClick={() => navigate('/')}
                    className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                VETRI CIX
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Intelligence Platform</p>
                        </div>
                    </div>
                </div>

                {/* User profile */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Navigation */}
                    <nav className="p-4">
                        <ul className="space-y-1">
                            {navItems.map((item) => (
                                <li key={item.to}>
                                    {item.external ? (
                                        <a
                                            href={item.to}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                            {item.comingSoon && (
                                                <span className="ml-auto text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                                    Soon
                                                </span>
                                            )}
                                        </a>
                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) => `
                          flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                          ${isActive
                                                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }
                        `}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                            {item.comingSoon && (
                                                <span className="ml-auto text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                                    Soon
                                                </span>
                                            )}
                                        </NavLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Stats section */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4">
                            <p className="text-sm font-medium mb-2 font-orbitron text-blue-500 text-[10px] uppercase">Live Infrastructure</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Total Companies</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats.totalCompanies.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Processed Today</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stats.processedToday}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Intelligence Efficiency</span>
                                    <span className="font-bold text-green-500">{stats.successRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close button (mobile) */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X className="w-5 h-5" />
                </button>
            </aside>
        </>
    )
}

export default Sidebar
