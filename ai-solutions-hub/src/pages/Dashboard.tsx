import React, { useState } from 'react';
import { Home, TrendingUp, Scale, Package, Phone, Mail, BarChart, Truck, FileText, CreditCard, Users, Settings, LogOut } from 'lucide-react';
import { BUSINESS_TOOLS } from '../types';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'tools', label: 'Business Tools', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <div className="font-bold text-slate-900">AI Solutions Hub</div>
              <div className="text-xs text-slate-500">Enterprise Plan</div>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-semibold text-slate-900 mb-2">Usage This Month</div>
            <div className="text-2xl font-bold text-blue-600 mb-1">325K</div>
            <div className="text-xs text-slate-600">of 500K AI tokens</div>
            <div className="mt-2 bg-white rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, Sarah</h1>
              <p className="text-slate-600">Here's what's happening with your AI solutions today</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <LogOut className="w-5 h-5 text-slate-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-sm text-slate-600 mb-2">API Requests</div>
                  <div className="text-3xl font-bold text-slate-900">1,247</div>
                  <div className="text-sm text-green-600 mt-2">+12% from last month</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-sm text-slate-600 mb-2">Cost Saved</div>
                  <div className="text-3xl font-bold text-slate-900">$245.67</div>
                  <div className="text-sm text-green-600 mt-2">64% savings</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-sm text-slate-600 mb-2">Efficiency</div>
                  <div className="text-3xl font-bold text-slate-900">92%</div>
                  <div className="text-sm text-blue-600 mt-2">Excellent performance</div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="text-sm text-slate-600 mb-2">Avg Response</div>
                  <div className="text-3xl font-bold text-slate-900">1.2s</div>
                  <div className="text-sm text-green-600 mt-2">45% faster</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { tool: 'Marketing Analysis', time: '5 min ago', status: 'completed' },
                    { tool: 'Legal Review', time: '32 min ago', status: 'completed' },
                    { tool: 'Data Analysis', time: '1 hour ago', status: 'completed' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{activity.tool}</div>
                        <div className="text-sm text-slate-600">{activity.time}</div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'tools' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Business Tools</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {BUSINESS_TOOLS.map((tool) => (
                  <div key={tool.id} className="p-6 bg-white rounded-xl shadow-sm border-2 border-slate-200 hover:border-blue-400 transition-all cursor-pointer">
                    <div className="text-sm font-semibold text-blue-600 mb-2">{tool.category}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">{tool.description}</p>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Open Tool
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'billing' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Billing & Subscription</h2>
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Enterprise Plan</h3>
                    <p className="text-slate-600">$299/month - Unlimited AI tokens</p>
                  </div>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">Active</span>
                </div>
                <div className="border-t border-slate-200 pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Current Period</div>
                      <div className="font-semibold text-slate-900">Nov 1 - Nov 30, 2025</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Next Billing Date</div>
                      <div className="font-semibold text-slate-900">December 1, 2025</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Nov 1, 2025', amount: '$299.00', status: 'Paid' },
                    { date: 'Oct 1, 2025', amount: '$299.00', status: 'Paid' },
                    { date: 'Sep 1, 2025', amount: '$299.00', status: 'Paid' },
                  ].map((invoice, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{invoice.date}</div>
                        <div className="text-sm text-slate-600">Enterprise Plan - Monthly</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-slate-900">{invoice.amount}</div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {invoice.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'team' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Team Management</h2>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Invite Member
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Owner' },
                    { name: 'Mike Chen', email: 'mike@company.com', role: 'Admin' },
                    { name: 'Emily Rodriguez', email: 'emily@company.com', role: 'User' },
                  ].map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{member.name[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{member.name}</div>
                          <div className="text-sm text-slate-600">{member.email}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
