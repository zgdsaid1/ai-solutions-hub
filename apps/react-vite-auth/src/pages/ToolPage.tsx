import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { callEdgeFunction, EDGE_FUNCTIONS } from '../lib/supabase';
import { AI_TOOLS } from '../types';
import { ArrowLeft, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tool = AI_TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tool not found</h1>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    setSuccess(false);
    setOutput('');

    try {
      const functionUrl = (EDGE_FUNCTIONS as any)[toCamelCase(tool.endpoint)];
      
      const requestData = getRequestData(tool.id, input);
      const result = await callEdgeFunction(functionUrl, requestData);

      setOutput(formatOutput(result));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                <span className="text-white font-bold">{tool.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{tool.name}</h1>
                <p className="text-sm text-gray-500">{tool.category}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tool Description */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b">
            <p className="text-gray-700">{tool.description}</p>
          </div>

          {/* Input Section */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
                  {getInputLabel(tool.id)}
                </label>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  placeholder={getInputPlaceholder(tool.id)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output Section */}
          {(output || success) && (
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Result</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {output}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for best results</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {getTips(tool.id).map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function getInputLabel(toolId: string): string {
  const labels: Record<string, string> = {
    'marketing-strategist': 'Describe your product or business',
    'legal-advisor': 'Enter your legal question or document text',
    'data-analyzer': 'Paste your data or describe the analysis needed',
    'email-assistant': 'Describe the email you want to create',
    'document-automation': 'Specify the document type and requirements',
    'customer-support': 'Enter customer inquiry or ticket details',
    'sales-assistant': 'Describe the lead or sales scenario',
    'content-creator': 'Describe the content you want to create',
  };
  return labels[toolId] || 'Enter your request';
}

function getInputPlaceholder(toolId: string): string {
  const placeholders: Record<string, string> = {
    'marketing-strategist': 'Example: I have a SaaS product for project management targeting small businesses...',
    'legal-advisor': 'Example: What are the legal requirements for starting an LLC in California?',
    'data-analyzer': 'Example: Analyze sales trends from Q1 2024 data: [paste data]',
    'email-assistant': 'Example: Create a follow-up email for a sales prospect who showed interest...',
    'document-automation': 'Example: Generate a professional invoice template with line items...',
    'customer-support': 'Example: Customer is having trouble logging into their account...',
    'sales-assistant': 'Example: Qualify this lead: Company with 50 employees, interested in enterprise plan...',
    'content-creator': 'Example: Write a blog post about the benefits of AI in business...',
  };
  return placeholders[toolId] || 'Enter your request here...';
}

function getTips(toolId: string): string[] {
  const tips: Record<string, string[]> = {
    'marketing-strategist': [
      'Provide specific details about your target audience',
      'Include your unique value proposition',
      'Mention your budget and timeline if applicable',
    ],
    'legal-advisor': [
      'Be specific about jurisdiction and context',
      'Include relevant dates and parties involved',
      'Note: This is for informational purposes only, not legal advice',
    ],
    'data-analyzer': [
      'Provide clean, structured data when possible',
      'Specify what insights you are looking for',
      'Include relevant context about your business',
    ],
    'email-assistant': [
      'Specify the purpose and tone of the email',
      'Include recipient context if relevant',
      'Mention any key points to cover',
    ],
    'document-automation': [
      'Clearly specify the document type needed',
      'Include all required fields and sections',
      'Mention formatting preferences',
    ],
    'customer-support': [
      'Include all relevant customer information',
      'Describe the issue in detail',
      'Specify desired resolution if known',
    ],
    'sales-assistant': [
      'Provide lead qualification criteria',
      'Include budget and timeline information',
      'Mention decision-makers if known',
    ],
    'content-creator': [
      'Specify target audience and platform',
      'Include SEO keywords if applicable',
      'Mention desired tone and length',
    ],
  };
  return tips[toolId] || ['Provide clear, specific information', 'Include relevant context', 'Be detailed in your request'];
}

function getRequestData(toolId: string, input: string): any {
  // Map tool IDs to appropriate request formats
  const dataMap: Record<string, any> = {
    'marketing-strategist': { productDescription: input, action: 'generate_strategy' },
    'legal-advisor': { question: input, action: 'analyze' },
    'data-analyzer': { data: input, action: 'analyze' },
    'email-assistant': { context: input, action: 'generate' },
    'document-automation': { requirements: input, action: 'generate' },
    'customer-support': { inquiry: input, action: 'analyze' },
    'sales-assistant': { leadInfo: input, action: 'qualify' },
    'content-creator': { topic: input, action: 'create' },
  };
  return dataMap[toolId] || { prompt: input };
}

function formatOutput(result: any): string {
  if (typeof result === 'string') return result;
  if (result.data) {
    if (typeof result.data === 'string') return result.data;
    if (result.data.response) return result.data.response;
    if (result.data.content) return result.data.content;
  }
  return JSON.stringify(result, null, 2);
}
