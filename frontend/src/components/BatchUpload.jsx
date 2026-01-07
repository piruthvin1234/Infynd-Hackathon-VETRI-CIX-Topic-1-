import React, { useState, useEffect } from 'react';
import { startBatch, getBatchStatus, processBulk } from '../services/api';
import { Loader2, FolderOpen, CheckCircle, XCircle, Play, Upload, FileSpreadsheet, Download } from 'lucide-react';

export default function BatchUpload({ onComplete }) {
    const [path, setPath] = useState('');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [polling, setPolling] = useState(false);
    const [uploadMode, setUploadMode] = useState('file'); // 'directory' or 'file'

    useEffect(() => {
        let interval;
        if (polling) {
            interval = setInterval(async () => {
                const s = await getBatchStatus();
                setStatus(s);
                if (s.processed + s.failed >= s.total && s.total > 0) {
                    setPolling(false);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [polling]);

    const handleStart = async () => {
        if (uploadMode === 'directory' && !path) return;
        if (uploadMode === 'file' && !file) return;

        try {
            if (uploadMode === 'directory') {
                await startBatch(path);
            } else {
                await processBulk(file);
            }
            setPolling(true);
        } catch (e) {
            alert("Failed to start batch: " + e.message);
        }
    };

    const handleBrowse = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.directory = true;
        input.onchange = (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                setPath(files[0].path || files[0].webkitRelativePath.split('/')[0]);
            }
        };
        input.click();
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleExport = async () => {
        try {
            const { exportBatch } = await import('../services/api');
            await exportBatch();
        } catch (e) {
            alert("Export failed: " + e.message);
        }
    };

    const tableHeaders = [
        "Company Name", "Domain", "Industry", "Sub-Industry", "Description",
        "Headquarters", "Full Address", "Email", "Phone", "Sales Phone",
        "Fax", "Mobile", "Other Numbers", "Hours", "HQ Indicator"
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Batch Processing Engine</h2>
                <p className="text-slate-500 mb-6">Process multiple companies automatically with deduplication and patch processing.</p>

                <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
                    <button
                        onClick={() => setUploadMode('file')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadMode === 'file' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <FileSpreadsheet className="w-4 h-4" /> CSV / Excel Upload
                    </button>
                    <button
                        onClick={() => setUploadMode('directory')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadMode === 'directory' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <FolderOpen className="w-4 h-4" /> Local Directory
                    </button>
                </div>

                <div className="flex gap-4 mb-8">
                    {uploadMode === 'directory' ? (
                        <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-primary transition-all">
                            <FolderOpen className="text-slate-400 w-5 h-5 mr-3" />
                            <input
                                type="text"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                placeholder="e.g., C:\Data\Companies_Dump"
                                className="flex-1 py-3 bg-transparent focus:outline-none text-slate-700"
                            />
                            <button
                                onClick={handleBrowse}
                                className="ml-2 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Browse folder"
                            >
                                <FolderOpen className="text-slate-500 w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-primary transition-all">
                            <Upload className="text-slate-400 w-5 h-5 mr-3" />
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileSelect}
                                className="flex-1 py-3 bg-transparent focus:outline-none text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={polling || (uploadMode === 'directory' ? !path : !file)}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                        {polling ? <Loader2 className="animate-spin h-5 w-5" /> : <Play className="w-5 h-5" />}
                        Start Batch
                    </button>
                </div>

                {status && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                            <div className="flex gap-4">
                                <span>Progress: {status.processed + status.failed} / {status.total}</span>
                                <span>{Math.round(((status.processed + status.failed) / (status.total || 1)) * 100)}%</span>
                            </div>
                            {(status.processed + status.failed >= status.total) && (
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 text-primary hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-lg"
                                >
                                    <Download className="w-4 h-4" /> Download XLSX
                                </button>
                            )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${((status.processed + status.failed) / (status.total || 1)) * 100}%` }}
                            ></div>
                        </div>

                        {status.current_company && (
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-sm animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing: <span className="font-semibold">{status.current_company}</span>
                            </div>
                        )}

                        <div className="border rounded-lg overflow-hidden max-h-[500px] shadow-sm">
                            <div className="overflow-x-auto overflow-y-auto max-h-full">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 border-b">
                                        <tr>
                                            <th className="px-4 py-3 border-r min-w-[150px]">Status</th>
                                            {tableHeaders.map(h => (
                                                <th key={h} className="px-4 py-3 border-r min-w-[150px] whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {status.results.map((res, idx) => (
                                            <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-2 border-r font-medium">
                                                    {res.error ? (
                                                        <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" /> Failed</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> Success</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 border-r truncate max-w-[200px]">{res.company_name?.value || res.company_name}</td>
                                                <td className="px-4 py-2 border-r truncate max-w-[150px]">{res.domain?.value || res.domain}</td>
                                                <td className="px-4 py-2 border-r truncate max-w-[150px]">{res.industry?.value || res.industry}</td>
                                                <td className="px-4 py-2 border-r truncate max-w-[150px]">{res.sub_industry?.value || res.sub_industry}</td>
                                                <td className="px-4 py-2 border-r truncate max-w-[300px]">{res.short_description?.value || res.short_description}</td>
                                                <td className="px-4 py-2 border-r truncate max-w-[150px]">{res.headquarters?.value || res.headquarters}</td>
                                                <td className="px-4 py-2 border-r truncate max-w-[250px]">{res.full_address?.value || res.full_address}</td>
                                                <td className="px-4 py-2 border-r truncate">{res.contact_email?.value || res.contact_email}</td>
                                                <td className="px-4 py-2 border-r truncate">{res.contact_phone?.value || res.contact_phone}</td>
                                                <td className="px-4 py-2 border-r truncate">{res.sales_phone?.value || res.sales_phone}</td>
                                                <td className="px-4 py-2 border-r truncate">{res.fax?.value || res.fax}</td>
                                                <td className="px-4 py-2 border-r truncate">{res.mobile?.value || res.mobile}</td>
                                                <td className="px-4 py-2 border-r truncate">{res.other_numbers?.value || res.other_numbers}</td>
                                                <td className="px-4 py-2 border-r truncate max-w-[150px]">{res.hours_of_operation?.value || res.hours_of_operation}</td>
                                                <td className="px-4 py-2 border-r text-center">{res.hq_indicator?.value || res.hq_indicator}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
