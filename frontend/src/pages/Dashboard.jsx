import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Users, Database, Zap, Clock, BarChart3, Globe, Mail, Phone, MapPin } from 'lucide-react'
import ParticleTimeline from '../components/charts/ParticleTimeline'
import OmniViewChart from '../components/charts/OmniViewChart'
import { getStats, getCompanies } from '../services/api'

const Dashboard = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalCompanies: 0,
        processedToday: 0,
        successRate: 0,
        avgProcessingTime: '0s'
    })

    const [recentActivity, setRecentActivity] = useState([])
    const [chartData, setChartData] = useState([])
    const [industryData, setIndustryData] = useState([])
    const [recentCompanies, setRecentCompanies] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, companiesData] = await Promise.all([
                    getStats(),
                    getCompanies()
                ])

                setStats({
                    totalCompanies: statsData.totalCompanies,
                    processedToday: statsData.processedToday,
                    successRate: statsData.successRate,
                    avgProcessingTime: statsData.avgProcessingTime
                })

                setIndustryData(statsData.industryDistribution)
                setChartData(statsData.weeklyActivity)

                // For activity, we take the last 5 companies
                const recent = companiesData.slice(0, 5).map(c => {
                    const date = new Date(c.created_at)
                    const now = new Date()
                    const diffMs = now - date
                    const diffMins = Math.floor(diffMs / 60000)
                    const timeStr = diffMins < 60 ? `${diffMins}m ago` : (c.lastAnalyzed || 'Recent')

                    return {
                        id: c.id,
                        company: c.name,
                        action: 'Analyzed',
                        time: timeStr,
                        status: 'success'
                    }
                })
                setRecentActivity(recent)

                // Detailed companies for the list
                setRecentCompanies(companiesData.slice(0, 5).map(c => ({
                    id: c.id,
                    name: c.name,
                    industry: c.industry,
                    ceo: c.ceo,
                    location: c.location,
                    extracted: true,
                    email: c.email,
                    phone: c.phone
                })))

            } catch (error) {
                console.error("Dashboard Fetch Error:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 30000) // Refresh every 30s

        return () => clearInterval(interval)
    }, [])

    const statCards = [
        {
            title: 'Total Companies',
            value: stats.totalCompanies.toLocaleString(),
            icon: Database,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Processed Today',
            value: stats.processedToday,
            icon: Zap,
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Success Rate',
            value: `${stats.successRate}%`,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Avg Processing Time',
            value: stats.avgProcessingTime,
            icon: Clock,
            color: 'from-orange-500 to-red-500'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome back! Here's what's happening with your data.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/analyze')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                    New Analysis
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <div className="bg-[#020617] rounded-xl p-6 border border-blue-900/30 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20" />
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
                            <p className="text-sm text-blue-400/60">Companies analyzed per day</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="h-80">
                        <ParticleTimeline data={chartData} />
                    </div>
                </div>

                {/* Industry Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Industry Distribution</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Breakdown by industry</p>
                        </div>
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-80 bg-[#030305] rounded-xl overflow-hidden">
                        <OmniViewChart data={industryData} />
                    </div>
                </div>
            </div>

            {/* Recent Activity & Companies */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium">{activity.company}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Companies */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Recently Analyzed</h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentCompanies.map((company) => (
                            <div key={company.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold">{company.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{company.industry}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${company.extracted
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                        {company.extracted ? 'Extracted' : 'Pending'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 font-medium">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span className="truncate">{company.ceo}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">{company.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{company.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                        <Phone className="w-4 h-4" />
                                        <span className="truncate">{company.phone}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
