import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  Mic, 
  BarChart3, 
  Clock, 
  User,
  TrendingUp,
  ArrowLeft,
  Bot,
  PhoneCall,
  MessageCircle,
  Trash2,
  Sparkles
} from 'lucide-react';

interface ConversationLog {
  id: string;
  conversation_type: string;
  phone_number: string;
  direction: string;
  message_content: string;
  call_duration?: number;
  call_status?: string;
  ai_response?: string;
  created_at: string;
  metadata?: any;
}

interface Analytics {
  total_communications: number;
  total_sms: number;
  total_calls: number;
  outbound_count: number;
  inbound_count: number;
  ai_enhanced_count: number;
  average_call_duration_seconds: number;
  recent_contacts: string[];
}

export default function VoiceSMSModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sms' | 'voice' | 'history' | 'analytics'>('sms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // SMS state
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsContext, setSmsContext] = useState('');
  const [useAIForSMS, setUseAIForSMS] = useState(false);

  // Voice state
  const [voicePhoneNumber, setVoicePhoneNumber] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [voiceContext, setVoiceContext] = useState('');
  const [useAIForVoice, setUseAIForVoice] = useState(false);

  // AI Assistant state
  const [incomingMessage, setIncomingMessage] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');

  // History state
  const [conversationHistory, setConversationHistory] = useState<ConversationLog[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'sms' | 'voice'>('all');

  // Analytics state
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (user && activeTab === 'history') {
      fetchConversationHistory();
    }
    if (user && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [user, activeTab, filterType]);

  const fetchConversationHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('voice-sms-agent', {
        body: {
          operation: 'get_conversation_history',
          conversation_type: filterType === 'all' ? undefined : filterType,
          limit: 50
        }
      });

      if (error) throw error;

      setConversationHistory(data.data?.history || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('voice-sms-agent', {
        body: {
          operation: 'get_analytics'
        }
      });

      if (error) throw error;

      setAnalytics(data.data?.analytics || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!smsPhoneNumber || !smsMessage) {
      setError('Please enter phone number and message');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('voice-sms-agent', {
        body: {
          operation: 'send_sms',
          phone_number: smsPhoneNumber,
          message: smsMessage,
          context: smsContext,
          use_ai: useAIForSMS
        }
      });

      if (error) throw error;

      setSuccess(
        data.data?.twilio_result?.success 
          ? 'SMS sent successfully!' 
          : 'SMS logged (Twilio not configured - would send in production)'
      );
      
      // Reset form
      setSmsPhoneNumber('');
      setSmsMessage('');
      setSmsContext('');
      setUseAIForSMS(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!voicePhoneNumber || !voiceMessage) {
      setError('Please enter phone number and message');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('voice-sms-agent', {
        body: {
          operation: 'initiate_call',
          phone_number: voicePhoneNumber,
          message: voiceMessage,
          context: voiceContext,
          use_ai: useAIForVoice
        }
      });

      if (error) throw error;

      setSuccess(
        data.data?.twilio_result?.success 
          ? 'Call initiated successfully!' 
          : 'Call logged (Twilio not configured - would initiate in production)'
      );
      
      // Reset form
      setVoicePhoneNumber('');
      setVoiceMessage('');
      setVoiceContext('');
      setUseAIForVoice(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIResponse = async () => {
    if (!incomingMessage) {
      setError('Please enter an incoming message');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('voice-sms-agent', {
        body: {
          operation: 'generate_ai_response',
          incoming_message: incomingMessage,
          conversation_history: []
        }
      });

      if (error) throw error;

      setAiSuggestion(data.data?.suggested_response || '');
      setSuccess('AI response generated!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const { error } = await supabase.functions.invoke('voice-sms-agent', {
        body: {
          operation: 'delete_log',
          log_id: logId
        }
      });

      if (error) throw error;

      setSuccess('Log deleted successfully');
      fetchConversationHistory();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500 p-3 rounded-xl">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voice & SMS Support Agent</h1>
              <p className="text-gray-600">AI-powered communication platform</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'sms'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              SMS
            </div>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'voice'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Voice
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              History
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </div>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send SMS Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Send SMS
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={smsPhoneNumber}
                    onChange={(e) => setSmsPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                    maxLength={160}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {smsMessage.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAIForSMS}
                      onChange={(e) => setUseAIForSMS(e.target.checked)}
                      className="w-4 h-4 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Enhance with AI
                    </span>
                  </label>
                </div>

                {useAIForSMS && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Context (Optional)
                    </label>
                    <input
                      type="text"
                      value={smsContext}
                      onChange={(e) => setSmsContext(e.target.value)}
                      placeholder="e.g., Appointment reminder, Customer follow-up"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                <button
                  onClick={handleSendSMS}
                  disabled={loading}
                  className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send SMS
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Response Generator */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                AI Response Assistant
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incoming Message
                  </label>
                  <textarea
                    value={incomingMessage}
                    onChange={(e) => setIncomingMessage(e.target.value)}
                    placeholder="Paste the customer's message here..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleGenerateAIResponse}
                  disabled={loading}
                  className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate AI Response
                    </>
                  )}
                </button>

                {aiSuggestion && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Suggested Response:</p>
                    <p className="text-gray-900">{aiSuggestion}</p>
                    <button
                      onClick={() => {
                        setSmsMessage(aiSuggestion);
                        setActiveTab('sms');
                      }}
                      className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Use This Response
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-500" />
                Initiate Voice Call
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={voicePhoneNumber}
                    onChange={(e) => setVoicePhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Message Script
                  </label>
                  <textarea
                    value={voiceMessage}
                    onChange={(e) => setVoiceMessage(e.target.value)}
                    placeholder="Enter the message to be spoken..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAIForVoice}
                      onChange={(e) => setUseAIForVoice(e.target.checked)}
                      className="w-4 h-4 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Enhance with AI
                    </span>
                  </label>
                </div>

                {useAIForVoice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Context (Optional)
                    </label>
                    <input
                      type="text"
                      value={voiceContext}
                      onChange={(e) => setVoiceContext(e.target.value)}
                      placeholder="e.g., Product announcement, Survey call"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                <button
                  onClick={handleInitiateCall}
                  disabled={loading}
                  className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Initiating...</>
                  ) : (
                    <>
                      <PhoneCall className="w-5 h-5" />
                      Initiate Call
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Twilio credentials are required for actual call initiation. 
                    Without credentials, calls will be logged for tracking purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                Communication History
              </h2>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="sms">SMS Only</option>
                <option value="voice">Voice Only</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading history...</div>
            ) : conversationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No conversation history found
              </div>
            ) : (
              <div className="space-y-3">
                {conversationHistory.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {log.conversation_type === 'sms' ? (
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Phone className="w-5 h-5 text-green-500" />
                        )}
                        <span className="font-medium">{log.phone_number}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.direction === 'outbound' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {log.direction}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{log.message_content}</p>
                    {log.ai_response && (
                      <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-700 mb-1">AI Enhanced:</p>
                        <p className="text-sm text-gray-700">{log.ai_response}</p>
                      </div>
                    )}
                    {log.call_duration && (
                      <p className="text-sm text-gray-500 mt-2">
                        Duration: {Math.round(log.call_duration / 60)} minutes
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center py-8 text-gray-500">Loading analytics...</div>
            ) : analytics ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Communications</p>
                      <p className="text-2xl font-bold">{analytics.total_communications}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total SMS</p>
                      <p className="text-2xl font-bold">{analytics.total_sms}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Calls</p>
                      <p className="text-2xl font-bold">{analytics.total_calls}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Outbound</p>
                      <p className="text-2xl font-bold">{analytics.outbound_count}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-indigo-500 transform rotate-180" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Inbound</p>
                      <p className="text-2xl font-bold">{analytics.inbound_count}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Sparkles className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">AI Enhanced</p>
                      <p className="text-2xl font-bold">{analytics.ai_enhanced_count}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Clock className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Call Duration</p>
                      <p className="text-2xl font-bold">{analytics.average_call_duration_seconds}s</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <User className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recent Contacts</p>
                      <p className="text-2xl font-bold">{analytics.recent_contacts.length}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                No analytics data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
