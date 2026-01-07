import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RootLayout from './layouts/RootLayout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import BatchPage from './pages/BatchPage'
import LibraryPage from './pages/LibraryPage'

import AnalyzePage from './pages/AnalyzePage'
import ReportsPage from './pages/ReportsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import TeamPage from './pages/TeamPage'
import DocsPage from './pages/DocsPage'

const NotFound = () => <div className="p-6 text-center"><h1>404 - Not Found</h1></div>

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Protected routes with RootLayout */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<RootLayout />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analyze" element={<AnalyzePage />} />
                                <Route path="/batch" element={<BatchPage />} />
                                <Route path="/library" element={<LibraryPage />} />
                                <Route path="/reports" element={<ReportsPage />} />
                                <Route path="/analytics" element={<AnalyticsPage />} />
                                <Route path="/team" element={<TeamPage />} />
                                <Route path="/docs" element={<DocsPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                            </Route>
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    )
}

export default App
