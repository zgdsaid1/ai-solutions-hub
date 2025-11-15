import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
// @ts-ignore - recharts types issue
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Mail,
  Send,
  ArrowLeft,
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Eye,
  BarChart3
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  campaign_name: string;
  subject_line: string;
  email_content: string;
  recipient_list: Array<{ email: string; name?: string }>;
  ai_optimizations: any;
  send_status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  open_rate: number;
  click_rate: number;
  created_at: string;
  updated_at: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function EmailAssistantModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'edit' | 'analytics'>('dashboard');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('promotional');
  const [targetAudience, setTargetAudience] = useState('');
  const [productService, setProductService] = useState('');
  const [tone, setTone] = useState('professional');
  const [subjectLine, setSubjectLine] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [recipients, setRecipients] = useState<Array<{ email: string; name?: string }>>([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // AI suggestions
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('email-assistant', {
        body: { action: 'get_campaigns' }
      });

      if (error) throw error;
      if (data?.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSubjectLines = async () => {
    if (!campaignType) return;
    
    try {
      setGeneratingAI(true);
      const { data, error } = await supabase.functions.invoke('email-assistant', {
        body: {
          action: 'generate_subject',
          campaignType,
          targetAudience,
          productService,
          tone
        }
      });

      if (error) throw error;
      if (data?.subjectLines) {
        setSubjectSuggestions(data.subjectLines);
        setShowSubjectSuggestions(true);
      }
    } catch (error) {
      console.error('Error generating subject lines:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const generateEmailContent = async () => {
    if (!subjectLine) {
      alert('Please add a subject line first');
      return;
    }
    
    try {
      setGeneratingAI(true);
      const { data, error } = await supabase.functions.invoke('email-assistant', {
        body: {
          action: 'generate_content',
          campaignType,
          targetAudience,
          productService,
          tone,
          subjectLine
        }
      });

      if (error) throw error;
      if (data?.emailContent) {
        setEmailContent(data.emailContent);
      }
    } catch (error) {
      console.error('Error generating email content:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const addRecipient = () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    setRecipients([...recipients, { email: recipientEmail, name: recipientName }]);
    setRecipientEmail('');
    setRecipientName('');
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const createCampaign = async () => {
    if (!campaignName || !subjectLine || !emailContent) {
      alert('Please fill in campaign name, subject line, and email content');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('email-assistant', {
        body: {
          action: 'create_campaign',
          campaignName,
          subjectLine,
          emailContent,
          recipientList: recipients,
          scheduledAt: scheduledDate || null
        }
      });

      if (error) throw error;
      
      alert('Campaign created successfully!');
      resetForm();
      setActiveView('dashboard');
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('email-assistant', {
        body: {
          action: 'send_campaign',
          campaignId
        }
      });

      if (error) throw error;
      
      if (data?.simulatedSend) {
        alert('SendGrid API key not configured. Campaign saved as draft. Please configure SENDGRID_API_KEY to enable email sending.');
      } else {
        alert(`Campaign sent successfully! Sent: ${data.sentCount}, Failed: ${data.failedCount}`);
      }
      
      loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('email-assistant', {
        body: {
          action: 'delete_campaign',
          campaignId
        }
      });

      if (error) throw error;
      
      alert('Campaign deleted successfully');
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCampaignName('');
    setSubjectLine('');
    setEmailContent('');
    setRecipients([]);
    setScheduledDate('');
    setSubjectSuggestions([]);
    setShowSubjectSuggestions(false);
  };

  const getCampaignStats = () => {
    // Ensure campaigns is an array
    const campaignsArray = Array.isArray(campaigns) ? campaigns : [];
    const total = campaignsArray.length;
    const draft = campaignsArray.filter(c => c.send_status === 'draft').length;
    const sent = campaignsArray.filter(c => c.send_status === 'sent').length;
    const scheduled = campaignsArray.filter(c => c.send_status === 'scheduled').length;
    const avgOpenRate = campaignsArray.reduce((sum, c) => sum + c.open_rate, 0) / (total || 1);
    const avgClickRate = campaignsArray.reduce((sum, c) => sum + c.click_rate, 0) / (total || 1);
    
    return { total, draft, sent, scheduled, avgOpenRate, avgClickRate };
  };

  const stats = getCampaignStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Assistant</h1>
                <p className="text-gray-600 mt-1">AI-Powered Email Campaign Management</p>
              </div>
            </div>
            
            {activeView === 'dashboard' && (
              <button
                onClick={() => setActiveView('create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Campaign</span>
              </button>
            )}
          </div>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  </div>
                  <FileText className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sent</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.sent}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Open Rate</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.avgOpenRate.toFixed(1)}%</p>
                  </div>
                  <Eye className="h-12 w-12 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Click Rate</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.avgClickRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Campaigns</h2>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (Array.isArray(campaigns) ? campaigns : []).length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No campaigns yet. Create your first campaign!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {((Array.isArray(campaigns) ? campaigns : []) || []).map((campaign) => (
                    <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{campaign.campaign_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{campaign.subject_line}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              campaign.send_status === 'sent' ? 'bg-green-100 text-green-800' :
                              campaign.send_status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              campaign.send_status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {campaign.send_status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {campaign.recipient_list?.length || 0} recipients
                            </span>
                            {campaign.sent_at && (
                              <span className="text-xs text-gray-500">
                                Sent: {new Date(campaign.sent_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {campaign.send_status === 'draft' && (
                            <button
                              onClick={() => sendCampaign(campaign.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Send Campaign"
                            >
                              <Send className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteCampaign(campaign.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Campaign"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Campaign View */}
        {activeView === 'create' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    resetForm();
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>

              {/* Step 1: Campaign Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Sale 2025"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Type
                    </label>
                    <select
                      value={campaignType}
                      onChange={(e) => setCampaignType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="promotional">Promotional</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="announcement">Announcement</option>
                      <option value="welcome">Welcome Series</option>
                      <option value="transactional">Transactional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="enthusiastic">Enthusiastic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Small business owners, Tech enthusiasts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product/Service (Optional)
                  </label>
                  <input
                    type="text"
                    value={productService}
                    onChange={(e) => setProductService(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., AI Marketing Software, Cloud Hosting"
                  />
                </div>

                {/* Subject Line Generation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Subject Line
                    </label>
                    <button
                      onClick={generateSubjectLines}
                      disabled={generatingAI}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      {generatingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span>Generate with AI</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your compelling subject line"
                  />
                  
                  {showSubjectSuggestions && (Array.isArray(subjectSuggestions) ? subjectSuggestions : []).length > 0 && (
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">AI Suggestions:</p>
                      <div className="space-y-2">
                        {((Array.isArray(subjectSuggestions) ? subjectSuggestions : []) || []).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSubjectLine(suggestion);
                              setShowSubjectSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 bg-white rounded-md hover:bg-blue-100 transition-colors text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Content Generation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Content
                    </label>
                    <button
                      onClick={generateEmailContent}
                      disabled={generatingAI || !subjectLine}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      {generatingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span>Generate with AI</span>
                    </button>
                  </div>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Email content (HTML supported)"
                  />
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email address"
                    />
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Name (optional)"
                    />
                    <button
                      onClick={addRecipient}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {(Array.isArray(recipients) ? recipients : []).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {((Array.isArray(recipients) ? recipients : []) || []).map((recipient, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-sm">{recipient.name ? `${recipient.name} (${recipient.email})` : recipient.email}</span>
                          <button
                            onClick={() => removeRecipient(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to save as draft</p>
                </div>

                {/* Create Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setActiveView('dashboard');
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createCampaign}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Create Campaign</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
