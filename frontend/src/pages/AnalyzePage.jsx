import { useState } from 'react'
import { Search, Globe, Zap, AlertCircle, CheckCircle, Info, ExternalLink, Download } from 'lucide-react'
import { processWebsite, exportSingleCompany } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const AnalyzePage = () => {
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const handleAnalyze = async (e) => {
        e.preventDefault()
        if (!url) return

        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await processWebsite(url)
            setResult(data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to analyze website. Please check the URL and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Analyze Website</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Enter a website URL to extract company information and tech signals
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto">
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            Analyze
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 max-w-3xl mx-auto">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-slide-up">
                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    {result.profile?.logo_url?.value && (
                                        <img
                                            src={result.profile.logo_url.value}
                                            alt="Company Logo"
                                            className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-gray-100 shadow-sm"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {result.profile?.company_name?.value || 'Company Profile'}
                                        </h2>
                                        <a
                                            href={(result.profile?.domain?.value || '').startsWith('http') ? result.profile?.domain?.value : `https://${result.profile?.domain?.value}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                                        >
                                            {result.profile?.domain?.value} <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-4">
                                    {result.profile?.industry?.value && (
                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                                            {result.profile.industry.value}
                                        </span>
                                    )}
                                    {result.profile?.sub_industry?.value && (
                                        <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-100 dark:border-purple-800">
                                            {result.profile.sub_industry.value}
                                        </span>
                                    )}
                                    {result.profile?.headquarters?.value && (
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium flex items-center gap-1">
                                            📍 {result.profile.headquarters.value}
                                        </span>
                                    )}
                                    {result.profile?.founded_year?.value && (
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium flex items-center gap-1">
                                            📅 Est. {result.profile.founded_year.value}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => exportSingleCompany(result.profile.company_id, 'csv')}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" /> CSV
                                </button>
                                <button
                                    onClick={() => exportSingleCompany(result.profile.company_id, 'xlsx')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Left Column: Description, Products, People */}
                        <div className="md:col-span-2 space-y-6">

                            {/* About Section */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-500" /> About
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {result.profile?.long_description?.value || result.profile?.short_description?.value || 'No description available.'}
                                </p>
                            </div>

                            {/* Products & Services */}
                            {result.profile?.products_services?.value?.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-purple-500" /> Products & Services
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.profile.products_services.value.map((item, i) => (
                                            <span key={i} className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm border border-purple-100 dark:border-purple-800">
                                                {typeof item === 'object' ? JSON.stringify(item) : item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Key People */}
                            {result.profile?.key_people?.value?.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold mb-4">👥 Key People</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {result.profile.key_people.value.map((person, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold text-gray-500 shadow-inner">
                                                    {(person.name || '?')[0]}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-gray-900 dark:text-white truncate" title={person.name}>{person.name}</p>
                                                    <p className="text-sm text-blue-600 dark:text-blue-400 truncate" title={person.title}>{person.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Contact, Tech Stack, Metadata */}
                        <div className="space-y-6">
                            {/* Contact Details */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    {result.profile?.contact_email?.value && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
                                            <a href={`mailto:${result.profile.contact_email.value}`} className="text-blue-600 hover:underline break-all block">
                                                {result.profile.contact_email.value}
                                            </a>
                                        </div>
                                    )}
                                    {result.profile?.contact_phone?.value && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phone</p>
                                            <p className="text-gray-700 dark:text-gray-300">{result.profile.contact_phone.value}</p>
                                        </div>
                                    )}
                                    {result.profile?.full_address?.value && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Address</p>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm">{result.profile.full_address.value}</p>
                                        </div>
                                    )}
                                    {(result.profile?.sales_phone?.value || result.profile?.other_numbers?.value) && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Other Numbers</p>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                {result.profile.sales_phone?.value && <p>Sales: {result.profile.sales_phone.value}</p>}
                                                {result.profile.other_numbers?.value && <p>Other: {result.profile.other_numbers.value}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" /> Tech Stack
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.profile?.tech_stack_signals?.value?.length > 0 ? (
                                        result.profile.tech_stack_signals.value.map((tech, i) => (
                                            <span key={i} className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded text-xs font-medium border border-yellow-100 dark:border-yellow-800">
                                                {tech}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No signals detected</p>
                                    )}
                                </div>
                            </div>

                            {/* Analysis Metadata */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-center text-gray-400">
                                    Analysis ID: {result.profile?.company_id?.substring(0, 8)}<br />
                                    Source: {result.profile?.company_name?.source?.[0] || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AnalyzePage
