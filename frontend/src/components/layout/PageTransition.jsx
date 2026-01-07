import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import LoadingSpinner from '../ui/LoadingSpinner'

const PageTransition = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false)
    const location = useLocation()

    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 50)

        return () => clearTimeout(timer)
    }, [location.pathname])

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default PageTransition
