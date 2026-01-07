import React, { useState, useEffect } from 'react';
import GraphView from './GraphView';
import { getSimilarCompanies } from '../services/api';
import { MapPin, Users, Layers, Box, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';

export default function Dashboard({ data, onBack }) {
    const { profile, graph } = data;
    const [activeTab, setActiveTab] = useState('overview');
    const [similar, setSimilar] = useState([]);

    useEffect(() => {
        if (profile.company_id) {
            getSimilarCompanies(profile.company_id).then(setSimilar);
        }
    }, [profile.company_id]);

    // Helper to get value safely
    const val = (field) => field?.value || "";
    const conf = (field) => field?.confidence || 0;
    const src = (field) => field?.source || [];

    return (
        <div className="space-y-6 pb-10">
            {/* Header Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary">← Back to Search</button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const csvContent = "data:text/csv;charset=utf-8," +
                                    ["Company Name,Domain,Industry,Headquarters,Contact Email",
                                        `"${val(profile.company_name)}","${val(profile.domain)}","${val(profile.industry)}","${val(profile.headquarters)}","${val(profile.contact_email)}"`].join("\n");
                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement("a");
                                link.setAttribute("href", encodedUri);
                                link.setAttribute("download", `${val(profile.company_name) || 'company'}_profile.csv`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="text-sm flex items-center gap-2 text-primary hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                            <ExternalLink className="w-4 h-4" /> Export CSV
                        </button>
                        <button
                            onClick={() => {
                                // Create Excel-compatible data
                                import('xlsx').then(XLSX => {
                                    const ws_data = [
                                        ["Company Name", "Domain", "Industry", "Sub-Industry", "Headquarters", "Contact Email", "Contact Phone", "Products & Services", "Tech Stack", "Key People"],
                                        [
                                            val(profile.company_name),
                                            val(profile.domain),
                                            val(profile.industry),
                                            val(profile.sub_industry),
                                            val(profile.headquarters),
                                            val(profile.contact_email),
                                            val(profile.contact_phone),
                                            val(profile.products_services).join(", "),
                                            val(profile.tech_stack_signals).join(", "),
                                            val(profile.key_people).map(p => `${p.name} (${p.title})`).join("; ")
                                        ]
                                    ];
                                    const ws = XLSX.utils.aoa_to_sheet(ws_data);
                                    const wb = XLSX.utils.book_new();
                                    XLSX.utils.book_append_sheet(wb, ws, "Company Profile");
                                    XLSX.writeFile(wb, `${val(profile.company_name) || 'company'}_profile.xlsx`);
                                }).catch(() => {
                                    // Fallback: Simple CSV download if xlsx library not available
                                    alert("Excel export requires additional library. Using CSV instead.");
                                    const csvContent = "data:text/csv;charset=utf-8," +
                                        ["Company Name,Domain,Industry,Headquarters,Contact Email",
                                            `"${val(profile.company_name)}","${val(profile.domain)}","${val(profile.industry)}","${val(profile.headquarters)}","${val(profile.contact_email)}"`].join("\n");
                                    const encodedUri = encodeURI(csvContent);
                                    const link = document.createElement("a");
                                    link.setAttribute("href", encodedUri);
                                    link.setAttribute("download", `${val(profile.company_name) || 'company'}_profile.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                });
                            }}
                            className="text-sm flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors bg-green-50 px-3 py-1.5 rounded-lg"
                        >
                            <ExternalLink className="w-4 h-4" /> Export Excel
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">{val(profile.company_name)}</h1>
                            {val(profile.industry) && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {val(profile.industry)}
                                </span>
                            )}
                        </div>
                        <p className="text-lg text-slate-600 max-w-3xl">{val(profile.short_description)}</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-6 border-b border-slate-100 pb-1">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
                    <TabButton active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} label="Knowledge Graph" />
                    <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} label="Detailed Profile" />
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoCard
                        title="Products & Services"
                        icon={<Box className="text-blue-500" />}
                        items={val(profile.products_services)}
                        confidence={conf(profile.products_services)}
                    />
                    <PeopleCard people={val(profile.key_people)} />
                    <InfoCard
                        title="Tech Stack"
                        icon={<Layers className="text-indigo-500" />}
                        items={val(profile.tech_stack_signals)}
                        confidence={conf(profile.tech_stack_signals)}
                    />
                    <LocationCard hq={val(profile.headquarters)} offices={val(profile.office_locations)} />

                    {/* Similar Companies */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Users className="text-green-500" /> Similar Companies
                        </h3>
                        <div className="space-y-3">
                            {similar.map((c, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">{c.company_name}</span>
                                    <span className="text-xs font-bold text-green-600">{Math.round(c.score * 100)}% Match</span>
                                </div>
                            ))}
                            {similar.length === 0 && <p className="text-sm text-slate-400 italic">No matches found yet.</p>}
                        </div>
                    </div>

                    {/* Missing Info Alert */}
                    {profile.missing_fields && profile.missing_fields.length > 0 && (
                        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="text-orange-500 w-5 h-5" />
                                <h3 className="font-semibold text-slate-800">Missing Information</h3>
                            </div>
                            <ul className="space-y-2">
                                {profile.missing_fields.map((item, idx) => (
                                    <li key={idx} className="text-sm text-orange-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'graph' && (
                <div className="h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <GraphView graphData={graph} />
                </div>
            )}

            {activeTab === 'details' && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 space-y-6">
                    <section>
                        <h3 className="text-xl font-semibold mb-3">Full Description</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{val(profile.long_description)}</p>
                    </section>

                    <div className="grid grid-cols-2 gap-8">
                        <section>
                            <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
                            <div className="space-y-2">
                                <ContactRow label="Email" value={val(profile.contact_email)} />
                                <ContactRow label="Phone" value={val(profile.contact_phone)} />
                                <ContactRow label="Page" value={val(profile.contact_page)} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3">Source Attribution</h3>
                            <div className="text-sm text-slate-500 space-y-2">
                                <SourceRow label="Industry" sources={src(profile.industry)} />
                                <SourceRow label="Products" sources={src(profile.products_services)} />
                                <SourceRow label="People" sources={src(profile.key_people)} />
                                <SourceRow label="Tech Stack" sources={src(profile.tech_stack_signals)} />
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}

function ContactRow({ label, value }) {
    if (!value) return null;

    // Make email clickable
    if (label === "Email") {
        return (
            <div className="flex gap-2">
                <span className="font-medium text-slate-700 min-w-[60px]">{label}:</span>
                <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {value}
                </a>
            </div>
        );
    }

    // Make phone clickable
    if (label === "Phone") {
        // Clean phone number for tel: link
        const cleanPhone = value.replace(/[^0-9+]/g, '');
        return (
            <div className="flex gap-2">
                <span className="font-medium text-slate-700 min-w-[60px]">{label}:</span>
                <a href={`tel:${cleanPhone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {value}
                </a>
            </div>
        );
    }

    // Make contact page a full clickable URL
    if (label === "Page") {
        // If it's a relative path, make it absolute
        let fullUrl = value;
        if (value.startsWith('/')) {
            // Get domain from current profile
            const domain = window.location.hostname === 'localhost' ? value : value;
            fullUrl = value.startsWith('http') ? value : `https://${value.replace(/^\//, '')}`;
        } else if (!value.startsWith('http')) {
            fullUrl = `https://${value}`;
        }

        return (
            <div className="flex gap-2">
                <span className="font-medium text-slate-700 min-w-[60px]">{label}:</span>
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                    {value}
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <span className="font-medium text-slate-700 min-w-[60px]">{label}:</span>
            <span className="text-slate-600">{value}</span>
        </div>
    );
}

function SourceRow({ label, sources }) {
    if (!sources || sources.length === 0) return null;
    const mapSource = (s) => {
        if (s === 'LLM') return 'Website Content';
        if (s === 'Heuristic Analysis') return 'Heuristic';
        if (s === 'URL Extraction') return 'URL';
        return s;
    };
    const display = [...new Set(sources.map(mapSource).filter(Boolean))];
    return (
        <div className="flex gap-2">
            <span className="font-medium text-slate-700 min-w-[80px]">{label}:</span>
            <span className="text-slate-600">{display.join(', ')}</span>
        </div>
    );
}

function TabButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${active ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
                }`}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
    );
}

function InfoCard({ title, icon, items, confidence }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                </div>
                {confidence > 0 && (
                    <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500" title="Confidence Score">
                        {Math.round(confidence * 100)}%
                    </div>
                )}
            </div>
            {items && items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                            {item}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-400 italic">No data found</p>
            )}
        </div>
    );
}

function PeopleCard({ people }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
                <Users className="text-purple-500" />
                <h3 className="font-semibold text-slate-800">Key People</h3>
            </div>
            <div className="space-y-3">
                {people && people.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                            {p.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-800">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.title}</div>
                        </div>
                    </div>
                ))}
                {(!people || people.length === 0) && <p className="text-sm text-slate-400 italic">No people found</p>}
            </div>
        </div>
    );
}

function LocationCard({ hq, offices }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-red-500" />
                <h3 className="font-semibold text-slate-800">Locations</h3>
            </div>
            <div className="space-y-2">
                {hq && (
                    <div className="text-sm">
                        <span className="font-medium text-slate-700">HQ:</span> {hq}
                    </div>
                )}
                {offices && offices.length > 0 && (
                    <div className="text-sm">
                        <span className="font-medium text-slate-700">Offices:</span>
                        <ul className="list-disc list-inside text-slate-600 mt-1">
                            {offices.map((loc, i) => <li key={i}>{loc}</li>)}
                        </ul>
                    </div>
                )}
                {!hq && (!offices || offices.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No locations found</p>
                )}
            </div>
        </div>
    );
}
