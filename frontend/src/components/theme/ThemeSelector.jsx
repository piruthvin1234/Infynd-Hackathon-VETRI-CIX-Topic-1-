import { Palette, Check } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeSelector = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    const themes = [
        { id: 'default', name: 'Default', color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
        { id: 'light', name: 'Light', color: 'bg-gradient-to-r from-gray-100 to-gray-300' },
        { id: 'dark', name: 'Dark', color: 'bg-gradient-to-r from-gray-800 to-gray-900' },
    ]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Change theme"
            >
                <Palette className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-2">
                            <p className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Select Theme
                            </p>
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id)
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-6 h-6 rounded ${t.color}`} />
                                        <span className="text-sm">{t.name}</span>
                                    </div>
                                    {theme === t.id && (
                                        <Check className="w-4 h-4 text-blue-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default ThemeSelector
