import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, Filter, Search, Calendar, ChevronRight } from 'lucide-react'
import { getCompanies, exportSingleCompany } from '../services/api'

const ReportsPage = () => {
    const [reports, setReports] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const companies = await getCompanies()
                const formattedReports = companies.map(c => ({
                    id: c.id,
                    name: `${c.name} - Deep Analysis Report`,
                    company: c.name,
                    date: c.lastAnalyzed || 'Recent',
                    type: 'PDF',
                    size: '2.4 MB',
                    status: 'Ready'
                }))
                setReports(formattedReports)
            } catch (error) {
                console.error("Reports Fetch Error:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchReports()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Intelligence Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage and download your generated intelligence reports</p>
                </div>
                <button
                    onClick={() => navigate('/analyze')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Generate New Report
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Available Reports</h3>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Search reports..." className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {reports.length > 0 ? reports.map(report => (
                                <div key={report.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium group-hover:text-blue-600 transition-colors">{report.name}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                                                    <span>{report.size}</span>
                                                    <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-[10px] font-bold uppercase">{report.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => exportSingleCompany(report.id, 'xlsx')}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Download Excel Report"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No reports generated yet. Analyze a company to create a report.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Automated Reporting</h3>
                        <p className="text-blue-50 text-sm mb-4 leading-relaxed">
                            Schedule weekly or monthly intelligence summaries delivered directly to your inbox or integrated channels.
                        </p>
                        <button className="w-full py-2 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors">
                            Setup Scheduler
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-lg mb-4">Quick Insights</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Top Industry', value: 'Technology' },
                                { label: 'Growth Trend', value: '+24% YoY' },
                                { label: 'Tech Density', value: 'High' }
                            ].map((insight, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">{insight.label}</span>
                                    <span className="font-bold">{insight.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportsPage
