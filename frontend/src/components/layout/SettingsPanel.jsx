import { X, Palette, Moon, Sun, Lock, Bell, Globe, Download } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const SettingsPanel = ({ isOpen, onClose }) => {
    const { theme, setTheme, darkMode, toggleDarkMode } = useTheme()

    const themes = [
        { id: 'default', name: 'Default', color: 'from-blue-500 to-purple-500' },
        { id: 'light', name: 'Light', color: 'from-gray-100 to-gray-300' },
        { id: 'dark', name: 'Dark', color: 'from-gray-800 to-gray-900' },
    ]

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Settings</h2>
                            <p className="text-gray-600 dark:text-gray-400">Customize your experience</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Theme Settings */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Palette className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Theme & Appearance</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Customize the look and feel
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pl-13">
                            {/* Theme selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Theme</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${theme === t.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className={`w-full h-12 rounded bg-gradient-to-r ${t.color} mb-2`} />
                                            <span className="text-sm">{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dark mode toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {darkMode ? (
                                        <Moon className="w-5 h-5" />
                                    ) : (
                                        <Sun className="w-5 h-5" />
                                    )}
                                    <div>
                                        <p className="font-medium">Dark Mode</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Switch between light and dark themes
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleDarkMode}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Security</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Manage your account security
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-13">
                            <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Lock className="w-5 h-5" />
                                    <span>Change Password</span>
                                </div>
                                <span className="text-blue-600 text-sm">Update</span>
                            </button>

                            <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Bell className="w-5 h-5" />
                                    <span>Two-Factor Authentication</span>
                                </div>
                                <span className="text-gray-500 text-sm">Disabled</span>
                            </button>
                        </div>
                    </div>

                    {/* Export Settings */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Download className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Data & Export</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Configure export preferences
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-13">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <label className="block text-sm font-medium mb-2">Default Export Format</label>
                                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent">
                                    <option>Excel (.xlsx)</option>
                                    <option>CSV (.csv)</option>
                                    <option>JSON (.json)</option>
                                </select>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <label className="block text-sm font-medium mb-2">Include in Export</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="rounded" defaultChecked />
                                        <span className="ml-2">Company Details</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="rounded" defaultChecked />
                                        <span className="ml-2">Tech Stack</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="rounded" />
                                        <span className="ml-2">Similar Companies</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Language Settings */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Language & Region</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Set your preferred language
                                </p>
                            </div>
                        </div>

                        <div className="pl-13">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <label className="block text-sm font-medium mb-2">Language</label>
                                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent">
                                    <option>English (US)</option>
                                    <option>Español</option>
                                    <option>Français</option>
                                    <option>Deutsch</option>
                                    <option>日本語</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SettingsPanel
