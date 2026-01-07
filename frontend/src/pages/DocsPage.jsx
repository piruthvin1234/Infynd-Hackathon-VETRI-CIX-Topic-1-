import React from 'react'
import { Book, Code, Terminal, Zap, Search, ChevronRight, Play } from 'lucide-react'

const DocumentationPage = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-12 py-8">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Documentation
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Everything you need to master the VETRI CIX Intelligent Extraction Platform.
                </p>
                <div className="max-w-md mx-auto relative pt-4">
                    <Search className="absolute left-4 top-1/2 -ms-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search the docs..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: 'Getting Started', icon: Play, desc: 'Learn the core concepts and set up your first analysis in minutes.', color: 'text-blue-500' },
                    { title: 'API Reference', icon: Code, desc: 'Detailed documentation for integrating VETRI CIX into your own apps.', color: 'text-purple-500' },
                    { title: 'Extraction Guide', icon: Zap, desc: 'Advanced techniques for deep scraping and signal identification.', color: 'text-yellow-500' }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            {item.desc}
                        </p>
                        <div className="flex items-center text-blue-600 font-bold text-sm">
                            Read more <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative">
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold tracking-wider uppercase">
                            <Terminal className="w-3 h-3" /> CLI Access
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">Quick Start CLI</h2>
                        <p className="text-gray-400 leading-relaxed">
                            Analyze any website directly from your terminal using our lightweight CLI tool.
                        </p>
                        <div className="bg-black/50 p-4 rounded-xl font-mono text-sm border border-gray-800">
                            <span className="text-gray-500">$</span> npx vetri-cix-cli <span className="text-green-400">google.com</span>
                        </div>
                    </div>
                    <div className="hidden md:flex justify-center">
                        <div className="w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
                        <Book className="w-48 h-48 opacity-10 absolute" />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                <div className="grid gap-4">
                    {[
                        { q: "How accurate is the tech signal detection?", a: "VETRI CIX combines heuristic rule-bases with advanced LLM analysis, achieving 98%+ accuracy across common web stacks." },
                        { q: "Can I export data in Excel format?", a: "Yes, all analysis results can be exported as CSV or XLSX from the Batch Mode or Library pages." },
                        { q: "What is the token limit for LLM extraction?", a: "We currently support up to 30,000 characters per extraction cycle for maximum context comprehension." }
                    ].map((faq, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DocumentationPage
