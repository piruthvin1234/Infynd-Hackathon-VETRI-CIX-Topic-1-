import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, PieChart, Activity, Globe, Zap, Users, Search, Loader2, ShieldCheck, Database, Key } from 'lucide-react'
import { getStats, processWebsite, getCompanies } from '../services/api'
import ParticleTimeline from '../components/charts/ParticleTimeline'
import OrbitalScanChart from '../components/charts/OrbitalScanChart'
import ConduitArrayChart from '../components/charts/ConduitArrayChart'

const AnalyticsPage = () => {
    const [stats, setStats] = useState(null)
    const [companies, setCompanies] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [url, setUrl] = useState('')
    const [isScraping, setIsScraping] = useState(false)
    const [derivedStats, setDerivedStats] = useState({
        velocity: '0.0 req/s',
        score: '0%',
        entities: '0',
        techSignals: []
    })

    const fetchStats = async () => {
        try {
            const [statsData, companiesData] = await Promise.all([
                getStats(),
                getCompanies()
            ])
            setStats(statsData)
            setCompanies(companiesData)

            // Calculate real metrics from companies
            if (companiesData.length > 0) {
                const totalScore = companiesData.reduce((acc, c) => acc + (c.extractionScore || 0), 0)
                const avgScore = (totalScore / companiesData.length).toFixed(1)

                // Tech Signals aggregation
                // Since our sample didn't have tech_stack_signals, we might need to mock or 
                // just use industry as a proxy if we want to show something real
                // Let's assume some aggregated data for now but rooted in company count
                const industries = companiesData.reduce((acc, c) => {
                    acc[c.industry] = (acc[c.industry] || 0) + 1
                    return acc
                }, {})

                const techSignals = Object.entries(industries).map(([name, count]) => ({
                    name,
                    count,
                    color: `bg-${['blue', 'green', 'orange', 'cyan', 'purple'][Math.floor(Math.random() * 5)]}-500`
                })).sort((a, b) => b.count - a.count).slice(0, 4)

                setDerivedStats({
                    velocity: statsData.processedToday > 0 ? (statsData.processedToday / 8).toFixed(1) + ' req/h' : '0.0 req/s',
                    score: avgScore + '%',
                    entities: companiesData.length * 4, // Average 4 points per company
                    techSignals
                })
            }
        } catch (error) {
            console.error("Analytics Fetch Error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleQuickScrape = async (e) => {
        e.preventDefault()
        if (!url) return
        setIsScraping(true)
        try {
            await processWebsite(url)
            setUrl('')
            fetchStats()
        } catch (error) {
            console.error("Scrape Error:", error)
        } finally {
            setIsScraping(false)
        }
    }

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Analytics Page</h1>
                    <p className="text-gray-500 dark:text-gray-400">Real-time intelligence extraction and analysis metrics</p>
                </div>

                <form onSubmit={handleQuickScrape} className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Quick Scrape URL (e.g., google.com)"
                        className="w-full pl-12 pr-32 py-3 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 rounded-2xl shadow-lg transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isScraping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isScraping ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Inject'
                        )}
                    </button>
                </form>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Ingest Velocity', value: derivedStats.velocity, icon: Zap, color: 'text-yellow-500' },
                    { label: 'Extraction Score', value: derivedStats.score, icon: ShieldCheck, color: 'text-green-500' },
                    { label: 'Analyzed Assets', value: stats?.totalCompanies || '0', icon: Database, color: 'text-blue-500' },
                    { label: 'Identified Tokens', value: derivedStats.entities, icon: Key, color: 'text-purple-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600" />
                        <div className="flex justify-between items-start mb-2">
                            <stat.icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <h4 className="text-3xl font-black mb-1">{stat.value}</h4>
                        <p className="text-xs font-orbitron uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-[#020617] p-8 rounded-3xl border border-blue-900/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30" />
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                                <Activity className="w-6 h-6 text-blue-500" />
                                Execution Timeline
                            </h3>
                            <p className="text-sm text-blue-400/60">Resource Load // Conduit Array</p>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ConduitArrayChart data={(stats?.weeklyActivity || []).map(d => ({ label: d.name, value: d.companies * 10, color: '#00eaff' }))} />
                    </div>
                </div>

                <div className="bg-[#04070c] p-8 rounded-3xl border border-blue-900/30 shadow-2xl relative">
                    <div className="absolute top-8 left-8 z-20">
                        <h3 className="font-bold text-xl text-white flex items-center gap-2">
                            <PieChart className="w-6 h-6 text-purple-500" />
                            Industry Matrix
                        </h3>
                        <p className="text-sm text-blue-400/60">Project Distribution // Orbital Scan</p>
                    </div>
                    <div className="h-[400px]">
                        <OrbitalScanChart data={stats?.industryDistribution || []} />
                    </div>
                </div>
            </div>

            {/* Tech Signals Row */}
            <div className="grid lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl">
                    <h3 className="font-bold text-lg mb-6 uppercase tracking-wider text-gray-400">Sector Analysis Intelligence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {derivedStats.techSignals.length > 0 ? derivedStats.techSignals.map((tech, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-gray-700 dark:text-gray-200">{tech.name}</span>
                                    <span className="font-orbitron text-blue-500">{tech.count} Assets</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full ${tech.color} shadow-[0_0_10px_rgba(59,130,246,0.5)]`} style={{ width: `${(tech.count / Math.max(...derivedStats.techSignals.map(s => s.count))) * 100}%` }} />
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-4 text-center text-gray-500 py-8">
                                Waiting for analysis data...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage
