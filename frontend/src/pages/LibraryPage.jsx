import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Star, StarOff, Globe, Mail, Phone, Users, Calendar, MapPin } from 'lucide-react'

import { getCompanies } from '../services/api'

const LibraryPage = () => {
    const [companies, setCompanies] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await getCompanies()
                // Map API data to component structure
                const mapped = data.map(c => ({
                    id: c.id,
                    name: c.name,
                    website: c.domain.startsWith('http') ? c.domain : `https://${c.domain}`,
                    industry: c.industry || 'Unknown',
                    description: c.description || 'No description available.',
                    ceo: c.ceo || 'N/A',
                    location: c.location || 'N/A',
                    email: c.email || 'N/A',
                    phone: c.phone || 'N/A',
                    isBookmarked: false,
                    lastAnalyzed: c.lastAnalyzed || 'Recent',
                    extractionScore: c.extractionScore || 0
                }))
                setCompanies(mapped)
            } catch (error) {
                console.error("Library Fetch Error:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCompanies()
    }, [])

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState('all')
    const [sortBy, setSortBy] = useState('recent')
    const [viewMode, setViewMode] = useState('grid')

    const industries = ['all', 'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education']

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
        return matchesSearch && matchesIndustry
    })

    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name)
            case 'recent':
                return new Date(b.lastAnalyzed).getTime() - new Date(a.lastAnalyzed).getTime()
            case 'score':
                return b.extractionScore - a.extractionScore
            default:
                return 0
        }
    })

    const toggleBookmark = (id) => {
        setCompanies(prev => prev.map(company =>
            company.id === id ? { ...company, isBookmarked: !company.isBookmarked } : company
        ))
    }

    const exportData = () => {
        // Implement export logic
        alert('Exporting company data...')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Company Library</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Browse and manage your analyzed companies
                    </p>
                </div>
                <button
                    onClick={exportData}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Industry Filter */}
                    <div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent appearance-none"
                            >
                                {industries.map(industry => (
                                    <option key={industry} value={industry}>
                                        {industry === 'all' ? 'All Industries' : industry}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent appearance-none"
                        >
                            <option value="recent">Recently Analyzed</option>
                            <option value="name">Name A-Z</option>
                            <option value="score">Extraction Score</option>
                        </select>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredCompanies.length} of {companies.length} companies
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Companies Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCompanies.map((company) => (
                        <div key={company.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{company.name}</h3>
                                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                            {company.industry}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => toggleBookmark(company.id)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        {company.isBookmarked ? (
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        ) : (
                                            <StarOff className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                    {company.description}
                                </p>
                            </div>

                            {/* Details */}
                            <div className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Globe className="w-4 h-4 mr-2" />
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                            {company.website.replace('https://', '')}
                                        </a>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span>{company.email}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <span>{company.phone}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span className="truncate">{company.ceo}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span className="truncate">{company.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${company.extractionScore >= 90 ? 'bg-green-500' :
                                            company.extractionScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`} />
                                        <span className="text-sm font-medium">{company.extractionScore}% score</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left p-4">Company</th>
                                <th className="text-left p-4">Industry</th>
                                <th className="text-left p-4">Contact</th>
                                <th className="text-left p-4">CEO/Founder</th>
                                <th className="text-left p-4">Location</th>
                                <th className="text-left p-4">Score</th>
                                <th className="text-left p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCompanies.map((company) => (
                                <tr key={company.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => toggleBookmark(company.id)}>
                                                {company.isBookmarked ? (
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                ) : (
                                                    <StarOff className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                            <div>
                                                <div className="font-medium">{company.name}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">{company.website}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                            {company.industry}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="text-sm">{company.email}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{company.phone}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium">{company.ceo}</td>
                                    <td className="p-4 text-sm truncate max-w-[150px]">{company.location}</td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${company.extractionScore >= 90 ? 'bg-green-500' :
                                                company.extractionScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`} />
                                            <span className="text-sm font-medium">{company.extractionScore}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default LibraryPage
