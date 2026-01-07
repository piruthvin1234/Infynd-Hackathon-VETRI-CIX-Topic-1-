import React, { useState, useEffect } from 'react';
import { getCompanies, getCompany, API_URL } from '../services/api';
import { Loader2, Building, Calendar, Download } from 'lucide-react';

export default function CompanyList({ onSelect }) {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const list = await getCompanies();
            setCompanies(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id) => {
        setLoading(true);
        try {
            const data = await getCompany(id);
            onSelect(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format) => {
        window.open(`${API_URL}/export?format=${format}`, '_blank');
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Processed Companies</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => handleExport('xlsx')}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                </div>
            </div>

            {companies.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-xl border border-slate-200 text-slate-500">
                    No companies processed yet. Use Single or Batch mode to add companies.
                </div>
            ) : (
                <div className="grid gap-4">
                    {companies.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => handleSelect(c.id)}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary cursor-pointer transition-all flex justify-between items-center"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{c.name}</h3>
                                    <p className="text-sm text-slate-500">{c.industry}</p>
                                </div>
                            </div>
                            <div className="text-right text-sm text-slate-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(c.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
