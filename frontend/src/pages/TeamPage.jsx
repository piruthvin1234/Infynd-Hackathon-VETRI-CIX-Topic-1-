import React, { useState } from 'react'
import { Users, Mail, Shield, UserPlus, MoreVertical, Search, Globe, User } from 'lucide-react'

const TeamPage = () => {
    const [members] = useState([
        { id: 1, name: 'Pirut', email: 'pirut@infynd.com', role: 'Admin', status: 'Active', avatar: 'P' },
        { id: 2, name: 'Saran', email: 'saran@infynd.com', role: 'Editor', status: 'Active', avatar: 'S' },
        { id: 3, name: 'Vetri', email: 'vetri@infynd.com', role: 'Analyst', status: 'Away', avatar: 'V' }
    ])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Team Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Collaboration and permissions for your intelligence unit</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2 font-semibold">
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            {/* Team Roles */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: 'Admins', count: 1, desc: 'Full system access', icon: Shield, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
                    { title: 'Editors', count: 2, desc: 'Can manage data', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { title: 'Analysts', count: 4, desc: 'View and export reports', icon: Search, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' }
                ].map((role, i) => (
                    <div key={i} className={`${role.bg} p-6 rounded-2xl border border-gray-100 dark:border-gray-800`}>
                        <div className="flex justify-between items-start mb-4">
                            <role.icon className={`w-8 h-8 ${role.color}`} />
                            <span className="text-2xl font-bold">{role.count}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{role.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{role.desc}</p>
                    </div>
                ))}
            </div>

            {/* Members Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-xl">Active Members</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search members..." className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {members.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                                {member.avatar}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.role === 'Admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                member.role === 'Editor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                                    'bg-green-100 text-green-700 dark:bg-green-900/30'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <span className="text-sm">{member.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        2 hours ago
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-400">
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TeamPage
