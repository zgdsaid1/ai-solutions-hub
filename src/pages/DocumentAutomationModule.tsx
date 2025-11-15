import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Sparkles,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Send,
  Copy,
  Loader2,
  FileSignature,
  Workflow,
  History,
  PenTool,
  Save,
  Upload,
  Calendar,
  User,
  Mail,
  Settings
} from 'lucide-react';

// Interfaces
interface DocumentTemplate {
  id: string;
  template_name: string;
  template_type: string;
  content: string;
  variables: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface AutomationDocument {
  id: string;
  user_id: string;
  template_id: number;
  document_name: string;
  content: string;
  variables: Record<string, string>;
  status: 'draft' | 'pending_signature' | 'completed' | 'cancelled';
  version: number;
  created_at: string;
  updated_at: string;
}

interface DocumentSignature {
  id: string;
  document_id: number;
  requester_id: string;
  signer_email: string;
  signer_name: string;
  signature_type: string;
  signature_data?: string;
  signature_method?: string;
  status: 'pending' | 'signed' | 'declined';
  requested_at: string;
  signed_at?: string;
}

interface SignatureWorkflow {
  id: string;
  document_id: number;
  creator_id: string;
  workflow_name: string;
  approvers: Array<{ email: string; name: string; order: number }>;
  current_step: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export default function DocumentAutomationModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Main state
  const [activeView, setActiveView] = useState<'dashboard' | 'templates' | 'create' | 'documents' | 'signatures' | 'edit-template' | 'generate-ai' | 'sign-document'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAIGenerating] = useState(false);
  
  // Data state
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<AutomationDocument[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<AutomationDocument | null>(null);
  
  // Form state - Template Creation
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('contract');
  const [templateContent, setTemplateContent] = useState('');
  const [isPublicTemplate, setIsPublicTemplate] = useState(false);
  
  // Form state - Document Generation
  const [documentName, setDocumentName] = useState('');
  const [documentVariables, setDocumentVariables] = useState<Record<string, string>>({});
  const [useAI, setUseAI] = useState(false);
  
  // Form state - AI Template Generation
  const [aiTemplateType, setAITemplateType] = useState('');
  const [aiDescription, setAIDescription] = useState('');
  const [aiRequirements, setAIRequirements] = useState('');
  const [aiGeneratedTemplate, setAIGeneratedTemplate] = useState<any>(null);
  
  // Signature state
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);
  const [signerEmail, setSignerEmail] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalDocuments: 0,
    pendingSignatures: 0,
    completedDocuments: 0,
    recentActivity: []
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Update stats whenever templates or documents change
  useEffect(() => {
    setStats({
      totalTemplates: templates.length,
      totalDocuments: documents.length,
      pendingSignatures: documents.filter(d => d.status === 'pending_signature').length,
      completedDocuments: documents.filter(d => d.status === 'completed').length,
      recentActivity: documents.slice(0, 5).map(d => ({
        type: 'document',
        name: d.document_name,
        date: d.created_at,
        status: d.status
      }))
    });
  }, [templates, documents]);

  // Load all necessary data
  const loadData = async () => {
    if (!user) {
      console.log('User not authenticated, skipping data load');
      return;
    }
    
    setLoading(true);
    try {
      // Load templates and documents (stats will be calculated automatically via useEffect)
      await Promise.all([
        loadTemplates(),
        loadDocuments()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // API functions
  const loadTemplates = async () => {
    if (!user) {
      console.log('User not authenticated, skipping template load');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('document-automation', {
        body: { action: 'get_templates' },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data?.success && data?.templates) {
        setTemplates(data.templates);
      } else if (data?.error) {
        throw new Error(data.error.message || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Show user-friendly error message
      alert('Failed to load templates. Please try refreshing the page.');
    }
  };

  const loadDocuments = async () => {
    if (!user) {
      console.log('User not authenticated, skipping document load');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('document-automation', {
        body: { action: 'get_documents' },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data?.success && data?.documents) {
        setDocuments(data.documents);
      } else if (data?.error) {
        throw new Error(data.error.message || 'Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      // Show user-friendly error message
      alert('Failed to load documents. Please try refreshing the page.');
    }
  };

  const loadStats = async () => {
    // Calculate stats from loaded data
    setStats({
      totalTemplates: templates.length,
      totalDocuments: documents.length,
      pendingSignatures: documents.filter(d => d.status === 'pending_signature').length,
      completedDocuments: documents.filter(d => d.status === 'completed').length,
      recentActivity: documents.slice(0, 5).map(d => ({
        type: 'document',
        name: d.document_name,
        date: d.created_at,
        status: d.status
      }))
    });
  };

  const createTemplate = async () => {
    if (!templateName || !templateContent) {
      alert('Please fill in template name and content');
      return;
    }

    if (!user) {
      alert('Please log in to create templates');
      return;
    }
    
    setLoading(true);
    try {
      // Extract variables from template content
      const variableMatches = templateContent.match(/\{\{([A-Z_]+)\}\}/g) || [];
      const variables = [...new Set(variableMatches.map(v => v.replace(/[{}]/g, '')))];
      
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('document-automation', {
        body: {
          action: 'create_template',
          templateName,
          templateType,
          content: templateContent,
          variables,
          isPublic: isPublicTemplate
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        await loadTemplates();
        setActiveView('templates');
        resetTemplateForm();
        alert('Template created successfully!');
      } else if (data?.error) {
        throw new Error(data.error.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAITemplate = async () => {
    if (!aiTemplateType || !aiDescription) {
      alert('Please fill in template type and description');
      return;
    }

    if (!user) {
      alert('Please log in to generate AI templates');
      return;
    }
    
    setAIGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('document-automation', {
        body: {
          action: 'ai_generate_template',
          templateType: aiTemplateType,
          description: aiDescription,
          requirements: aiRequirements
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data?.success && data?.template) {
        setAIGeneratedTemplate(data.template);
        alert('AI template generated successfully!');
      } else if (data?.error) {
        throw new Error(data.error.message || 'Failed to generate AI template');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error generating AI template:', error);
      alert(`Failed to generate AI template: ${error.message || 'Please try again.'}`);
    } finally {
      setAIGenerating(false);
    }
  };

  const generateDocument = async () => {
    if (!selectedTemplate || !documentName) {
      alert('Please select a template and enter a document name');
      return;
    }

    if (!user) {
      alert('Please log in to generate documents');
      return;
    }
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('document-automation', {
        body: {
          action: 'generate_document',
          templateId: selectedTemplate.id,
          documentName,
          variables: documentVariables,
          useAI
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        await loadDocuments();
        setActiveView('documents');
        resetDocumentForm();
        alert('Document generated successfully!');
      } else if (data?.error) {
        throw new Error(data.error.message || 'Failed to generate document');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert(`Failed to generate document: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const requestSignature = async () => {
    if (!selectedDocument || !signerEmail || !signerName) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('document-automation', {
        body: {
          action: 'request_signature',
          documentId: selectedDocument.id,
          signerEmail,
          signerName,
          signatureType: 'electronic'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });
      
      if (error) throw error;
      
      await loadDocuments();
      setSignerEmail('');
      setSignerName('');
    } catch (error) {
      console.error('Error requesting signature:', error);
    } finally {
      setLoading(false);
    }
  };

  // Canvas signature functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Reset forms
  const resetTemplateForm = () => {
    setTemplateName('');
    setTemplateType('contract');
    setTemplateContent('');
    setIsPublicTemplate(false);
  };

  const resetDocumentForm = () => {
    setDocumentName('');
    setDocumentVariables({});
    setUseAI(false);
    setSelectedTemplate(null);
  };

  const resetAIForm = () => {
    setAITemplateType('');
    setAIDescription('');
    setAIRequirements('');
    setAIGeneratedTemplate(null);
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'pending_signature': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'draft': return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'pending_signature': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const templateTypeOptions = [
    'contract', 'nda', 'employment', 'service_agreement', 'partnership',
    'lease', 'purchase_order', 'invoice', 'proposal', 'other'
  ];

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Automation</h1>
          <p className="text-gray-600 mt-2">AI-powered document generation and e-signature workflows</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveView('generate-ai')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            AI Template
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Document
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
              <p className="text-gray-600 text-sm">Templates</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              <p className="text-gray-600 text-sm">Documents</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingSignatures}</p>
              <p className="text-gray-600 text-sm">Pending Signatures</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedDocuments}</p>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveView('templates')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
          >
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Create Document</h3>
            <p className="text-gray-600 text-sm">Generate documents from templates</p>
          </button>

          <button
            onClick={() => setActiveView('edit-template')}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
          >
            <Plus className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">New Template</h3>
            <p className="text-gray-600 text-sm">Create custom document templates</p>
          </button>

          <button
            onClick={() => setActiveView('generate-ai')}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
          >
            <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
            <p className="text-gray-600 text-sm">Generate templates with AI</p>
          </button>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Documents</h2>
        {documents.slice(0, 5).length > 0 ? (
          <div className="space-y-3">
            {documents.slice(0, 5).map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(document.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{document.document_name}</h3>
                    <p className="text-gray-600 text-sm">Created {formatDate(document.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(document.status)}>{document.status}</span>
                  <button
                    onClick={() => {
                      setSelectedDocument(document);
                      setActiveView('documents');
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No documents created yet</p>
        )}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Templates</h1>
            <p className="text-gray-600">Choose a template to create a new document</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('edit-template')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{template.template_name}</h3>
                  <p className="text-gray-600 text-sm capitalize">{template.template_type.replace('_', ' ')}</p>
                </div>
              </div>
              {template.is_public && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Public</span>
              )}
            </div>
            
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {template.content.substring(0, 150)}...
            </p>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-xs">
                {template.variables.length} variables
              </p>
              <button
                onClick={() => {
                  setSelectedTemplate(template);
                  setActiveView('create');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreateDocument = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView('templates')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Document</h1>
            <p className="text-gray-600">Using template: {selectedTemplate.template_name}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Document Settings</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={`${selectedTemplate.template_name} - ${new Date().toISOString().split('T')[0]}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="useAI" className="text-sm font-medium text-gray-700">
                Enhance with AI (improve language and clarity)
              </label>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Template Variables</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {selectedTemplate.variables.map((variable) => (
              <div key={variable}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {variable.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={documentVariables[variable] || ''}
                  onChange={(e) => setDocumentVariables({
                    ...documentVariables,
                    [variable]: e.target.value
                  })}
                  placeholder={`Enter ${variable.replace(/_/g, ' ').toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                resetDocumentForm();
                setActiveView('templates');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={generateDocument}
              disabled={loading || !documentName}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Generate Document
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage your generated documents</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('templates')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Document
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documents.length > 0 ? (
          documents.map((document) => (
            <div key={document.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{document.document_name}</h3>
                    <p className="text-gray-600 text-sm">Created {formatDate(document.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(document.status)}>
                    {document.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        // Show document content in an alert for now (could be improved with a modal)
                        alert(`Document Content:\n\n${document.content}`);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setActiveView('sign-document');
                      }}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Request Signature"
                    >
                      <FileSignature className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        // Download document as text file
                        const element = globalThis.document.createElement('a');
                        const file = new Blob([document.content], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = `${document.document_name}.txt`;
                        globalThis.document.body.appendChild(element);
                        element.click();
                        globalThis.document.body.removeChild(element);
                      }}
                      className="text-purple-600 hover:text-purple-800 p-1"
                      title="Download Document"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-700 text-sm mb-3 line-clamp-3">
                {document.content.substring(0, 200)}...
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Version {document.version}</span>
                <span>Updated {formatDate(document.updated_at)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-4">Create your first document from a template</p>
            <button
              onClick={() => setActiveView('templates')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Browse Templates
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAIGeneration = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Template Generator</h1>
          <p className="text-gray-600">Create professional templates with AI assistance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Template Requirements</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
              <select
                value={aiTemplateType}
                onChange={(e) => setAITemplateType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select template type</option>
                {templateTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={aiDescription}
                onChange={(e) => setAIDescription(e.target.value)}
                placeholder="Describe the purpose and key elements of your template..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements (Optional)</label>
              <textarea
                value={aiRequirements}
                onChange={(e) => setAIRequirements(e.target.value)}
                placeholder="Any specific clauses, terms, or legal requirements..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <button
              onClick={generateAITemplate}
              disabled={aiGenerating || !aiTemplateType || !aiDescription}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Template...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Template
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Template Preview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Template</h2>
          
          {aiGeneratedTemplate ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={aiGeneratedTemplate.suggested_name || ''}
                  onChange={(e) => setAIGeneratedTemplate({
                    ...aiGeneratedTemplate,
                    suggested_name: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Content</label>
                <textarea
                  value={aiGeneratedTemplate.content || ''}
                  onChange={(e) => setAIGeneratedTemplate({
                    ...aiGeneratedTemplate,
                    content: e.target.value
                  })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTemplateName(aiGeneratedTemplate.suggested_name || '');
                    setTemplateContent(aiGeneratedTemplate.content || '');
                    setTemplateType(aiTemplateType);
                    resetAIForm();
                    setActiveView('edit-template');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save as Template
                </button>
                <button
                  onClick={resetAIForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>Generated template will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditTemplate = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Template</h1>
          <p className="text-gray-600">Design a custom document template</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Template Details</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {templateTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublicTemplate}
                onChange={(e) => setIsPublicTemplate(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make this template public for other users
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createTemplate}
                disabled={loading || !templateName || !templateContent}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Template
              </button>
              <button
                onClick={() => {
                  resetTemplateForm();
                  setActiveView('dashboard');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Content
              <span className="text-gray-500 text-xs ml-1">(Use {`{{VARIABLE_NAME}}`} for placeholders)</span>
            </label>
            <textarea
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="Enter your template content here...

Example:
SERVICE AGREEMENT

This agreement is made on {{AGREEMENT_DATE}} between {{CLIENT_NAME}} and {{SERVICE_PROVIDER}}.

Services: {{SERVICES_DESCRIPTION}}

Payment: {{PAYMENT_AMOUNT}}"
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSignDocument = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveView('documents')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Signature</h1>
          <p className="text-gray-600">
            Document: {selectedDocument?.document_name}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Signature Request</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signer Email</label>
            <input
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="Enter signer's email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signer Name</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter signer's full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={requestSignature}
            disabled={loading || !signerEmail || !signerName}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Signature Request
          </button>
          <button
            onClick={() => setActiveView('documents')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span>Loading...</span>
            </div>
          </div>
        )}

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'templates' && renderTemplates()}
        {activeView === 'create' && renderCreateDocument()}
        
        {/* Implement all views */}
        {activeView === 'documents' && renderDocuments()}
        {activeView === 'generate-ai' && renderAIGeneration()}
        {activeView === 'edit-template' && renderEditTemplate()}
        {activeView === 'sign-document' && renderSignDocument()}
      </div>
    </div>
  );
}