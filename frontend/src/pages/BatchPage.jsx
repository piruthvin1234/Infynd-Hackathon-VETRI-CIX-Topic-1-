import { useState, useRef, useEffect } from 'react'
import { Upload, FileUp, CheckCircle, AlertCircle, Clock, Download, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { processBulkFile, getBatchStatus, getBatchExport } from '../services/api'

const BatchPage = () => {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState(null)
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [showFailed, setShowFailed] = useState(false)
    const fileInputRef = useRef(null)

    const [batchResults, setBatchResults] = useState({
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        failedUrls: []
    })

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile)
        } else {
            alert('Please upload a CSV or Excel file')
        }
    }

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const startProcessing = async () => {
        if (!file) return

        setIsProcessing(true)
        setProgress(0)
        setIsCompleted(false)

        try {
            await processBulkFile(file)

            // Start polling for status
            const interval = setInterval(async () => {
                try {
                    const status = await getBatchStatus()

                    if (status.total > 0) {
                        const newProgress = ((status.processed + status.failed) / status.total) * 100
                        setProgress(Math.min(newProgress, 99))

                        setBatchResults({
                            total: status.total,
                            processed: status.processed + status.failed,
                            success: status.processed,
                            failed: status.failed,
                            failedUrls: status.results.filter(r => r.error).map(r => r.company_name || 'Unknown')
                        })

                        if (status.processed + status.failed >= status.total) {
                            clearInterval(interval)
                            setIsProcessing(false)
                            setIsCompleted(true)
                            setProgress(100)
                        }
                    }
                } catch (err) {
                    console.error("Batch Status Error:", err)
                }
            }, 2000)
        } catch (error) {
            console.error("Batch Upload Error:", error)
            alert("Failed to start batch processing")
            setIsProcessing(false)
        }
    }

    const retryFailed = () => {
        // Retry logic would involve re-submitting the failed URLs
        // For now, simpler to just alert the user to re-upload the list
        alert('To retry, please create a new file with the failed URLs and upload again.')
    }

    const downloadReport = async () => {
        try {
            const blob = await getBatchExport()
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'batch_results.xlsx')
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
        } catch (error) {
            console.error("Download Error:", error)
            alert("Failed to download report")
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Batch Processing</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Upload a CSV or Excel file containing company URLs for bulk analysis
                    </p>
                </div>
            </div>

            {/* Upload Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8">
                <div
                    className={`text-center ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {file ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-3">
                                <FileUp className="w-12 h-12 text-green-500" />
                                <div className="text-left">
                                    <h3 className="font-semibold">{file.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {(file.size / 1024).toFixed(2)} KB • Ready to process
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-3 justify-center">
                                <button
                                    onClick={() => setFile(null)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Remove File
                                </button>
                                <button
                                    onClick={startProcessing}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : 'Start Processing'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Upload a CSV or Excel file with company URLs
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                            >
                                Browse Files
                            </button>
                            <p className="text-sm text-gray-500 mt-4">
                                Supports .csv, .xlsx files up to 10MB
                            </p>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Progress Section */}
            {isProcessing && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold">Processing in Progress</h3>
                        </div>
                        <span className="text-sm font-medium">{progress}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="font-semibold">Estimated Time</div>
                            <div>~2 minutes</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="font-semibold">Companies Processed</div>
                            <div>{Math.floor(progress)}/100</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="font-semibold">Current Rate</div>
                            <div>~12 companies/sec</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {isCompleted && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <h3 className="font-semibold">Processing Complete!</h3>
                            </div>
                            <button
                                onClick={downloadReport}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </button>
                        </div>

                        {/* Results Summary */}
                        <div className="grid md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {batchResults.success}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {batchResults.failed}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {batchResults.total}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {((batchResults.success / batchResults.total) * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                            </div>
                        </div>

                        {/* Failed URLs */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <h4 className="font-semibold">Failed URLs ({batchResults.failed})</h4>
                                </div>
                                <button
                                    onClick={() => setShowFailed(!showFailed)}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                    {showFailed ? (
                                        <>
                                            <EyeOff className="w-4 h-4 mr-1" />
                                            Hide Failed
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 mr-1" />
                                            Show Failed
                                        </>
                                    )}
                                </button>
                            </div>

                            {showFailed && (
                                <div className="space-y-2">
                                    {batchResults.failedUrls.map((url, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                <span className="font-mono text-sm">{url}</span>
                                            </div>
                                            <button
                                                onClick={() => retryFailed()}
                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                Retry
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={retryFailed}
                                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 flex items-center"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Retry All Failed
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => {
                                setFile(null)
                                setIsCompleted(false)
                                setProgress(0)
                            }}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Process Another File
                        </button>
                        <button
                            onClick={downloadReport}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                        >
                            Download Detailed Report
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!file && !isProcessing && !isCompleted && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold mb-4">How to prepare your file:</h3>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                        <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                                1
                            </div>
                            <span>Create a CSV or Excel file with a column named "url" or "website"</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                                2
                            </div>
                            <span>Each row should contain one company URL (e.g., https://company.com)</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                                3
                            </div>
                            <span>Optional: Include additional columns like company_name for better matching</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                                4
                            </div>
                            <span>Upload the file and let VETRI CIX do the rest!</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

export default BatchPage
