import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Scale,
  FileText,
  ArrowLeft,
  Upload,
  Shield,
  AlertCircle,
  CheckCircle,
  Download,
  Copy,
  Loader2,
  Gavel,
  Building,
  DollarSign,
  Lock,
  BookOpen,
  Search,
  Users
} from 'lucide-react';

interface LegalConsultationData {
  consultationType: string;
  legalCategory: string;
  consultationDetails: string;
  urgencyLevel: string;
  documentDescription: string;
  specificQuestions: string;
  businessContext: string;
}

export default function LegalAdvisorModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [legalAdvice, setLegalAdvice] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LegalConsultationData>({
    consultationType: '',
    legalCategory: '',
    consultationDetails: '',
    urgencyLevel: 'medium',
    documentDescription: '',
    specificQuestions: '',
    businessContext: ''
  });

  const consultationTypes = [
    { value: 'legal-query', label: 'General Legal Consultation', icon: Scale },
    { value: 'analyze-document', label: 'Document Analysis & Review', icon: FileText },
    { value: 'contract-review', label: 'Contract Review & Risk Assessment', icon: Shield },
    { value: 'compliance-check', label: 'Compliance & Regulatory Check', icon: Lock },
    { value: 'legal-research', label: 'Legal Research & Precedents', icon: BookOpen }
  ];

  const legalCategories = [
    { value: 'business-law', label: 'Business & Corporate Law', icon: Building },
    { value: 'contract-law', label: 'Contract Law', icon: FileText },
    { value: 'employment-law', label: 'Employment Law', icon: Users },
    { value: 'intellectual-property', label: 'Intellectual Property', icon: Shield },
    { value: 'finance-law', label: 'Finance & Securities Law', icon: DollarSign },
    { value: 'compliance', label: 'Regulatory Compliance', icon: CheckCircle },
    { value: 'litigation', label: 'Litigation & Dispute Resolution', icon: Gavel },
    { value: 'real-estate', label: 'Real Estate Law', icon: Building }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority - General Inquiry', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority - Business Decision', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority - Time Sensitive', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent - Immediate Action Required', color: 'text-red-600' }
  ];

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX, TXT)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        alert('Please upload a PDF, DOC, DOCX, or TXT file.');
      }
    }
  };

  // Handle step 1: Service type selection and case details
  const handleStep1 = async () => {
    if (!formData.consultationType || !formData.consultationDetails) {
      alert('Please fill in consultation type and case details.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('legal-advisor', {
        body: {
          step: 1,
          data: {
            serviceType: formData.consultationType,
            caseTitle: formData.consultationDetails.substring(0, 100),
            urgencyLevel: formData.urgencyLevel
          }
        }
      });

      if (error) throw error;

      setSessionId(data.data.sessionId);
      setStep(2);
    } catch (error) {
      console.error('Step 1 error:', error);
      alert('Failed to process service selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle step 2: Legal category and detailed information
  const handleStep2 = async () => {
    if (!formData.legalCategory || !formData.businessContext) {
      alert('Please select legal category and provide detailed context.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('legal-advisor', {
        body: {
          step: 2,
          data: {
            sessionId: sessionId,
            legalCategory: formData.legalCategory,
            detailedDescription: formData.businessContext
          }
        }
      });

      if (error) throw error;

      setStep(3);
    } catch (error) {
      console.error('Step 2 error:', error);
      alert('Failed to process legal category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle step 3: Generate consultation
  const handleStep3 = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('legal-advisor', {
        body: {
          step: 3,
          data: {
            sessionId: sessionId,
            documents: uploadedFile ? [{ name: uploadedFile.name, type: uploadedFile.type }] : []
          }
        }
      });

      if (error) throw error;

      // Parse the consultation result
      const consultationText = data.data.consultation;
      
      // Convert consultation text to structured format for display
      const structuredAdvice = parseConsultationText(consultationText);
      setLegalAdvice(structuredAdvice);
      setStep(4);
    } catch (error) {
      console.error('Step 3 error:', error);
      alert('Failed to generate consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Parse consultation text into structured format
  const parseConsultationText = (text: string) => {
    const sections = {
      legal_summary: text.split('### Executive Summary')[1]?.split('###')[0]?.trim() || '',
      key_findings: [],
      risk_assessment: { risk_level: 'medium', risk_factors: [] },
      recommendations: [],
      legal_precedents: [],
      next_steps: []
    };

    // Extract sections using regex patterns
    const lines = text.split('\n');
    let currentSection = '';
    
    lines.forEach(line => {
      if (line.includes('Immediate Steps')) {
        currentSection = 'immediate';
      } else if (line.includes('Medium-term Actions')) {
        currentSection = 'medium';
      } else if (line.includes('Long-term Strategy')) {
        currentSection = 'long';
      } else if (line.match(/^\d+\./)) {
        const action = line.replace(/^\d+\.\s*/, '').trim();
        if (action && sections.recommendations.length < 10) {
          sections.recommendations.push(action);
        }
      } else if (line.includes('Required Documentation')) {
        currentSection = 'documentation';
      } else if (line.match(/^- /)) {
        const item = line.replace(/^- /, '').trim();
        if (item && currentSection !== 'documentation') {
          sections.key_findings.push(item);
        }
      }
    });

    // Add generated next steps based on urgency
    sections.next_steps = [
      'Review generated legal consultation thoroughly',
      'Verify all recommendations with qualified legal counsel',
      'Document compliance status',
      'Establish timeline for implementation'
    ];

    return sections;
  };

  // Handle export step
  const handleExport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('legal-advisor', {
        body: {
          step: 4,
          data: {
            sessionId: sessionId,
            exportFormat: 'txt'
          }
        }
      });

      if (error) throw error;

      const content = data.data.exportContent;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal-consultation-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export consultation. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (step === 1) {
      return handleStep1();
    } else if (step === 2) {
      return handleStep2();
    } else if (step === 3) {
      return handleStep3();
    } else if (step === 4) {
      return handleExport();
    }
  };

  const handleCopy = async () => {
    if (!legalAdvice) return;
    
    const content = formatAdviceForCopy();
    await navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatAdviceForCopy = () => {
    if (!legalAdvice) return '';

    return `
AI LEGAL ADVISOR CONSULTATION
===============================

Consultation Type: ${formData.consultationType}
Legal Category: ${formData.legalCategory}
Date: ${new Date().toLocaleDateString()}

${legalAdvice.legal_summary ? `SUMMARY:\n${legalAdvice.legal_summary}\n\n` : ''}

${legalAdvice.key_findings ? `KEY FINDINGS:\n${legalAdvice.key_findings.join('\n- ')}\n\n` : ''}

${legalAdvice.recommendations ? `RECOMMENDATIONS:\n${legalAdvice.recommendations.join('\n- ')}\n\n` : ''}

${legalAdvice.risk_assessment ? `RISK ASSESSMENT:\nRisk Level: ${legalAdvice.risk_assessment.risk_level}\nRisk Factors: ${legalAdvice.risk_assessment.risk_factors.join(', ')}\n\n` : ''}

${legalAdvice.legal_precedents ? `LEGAL PRECEDENTS:\n${legalAdvice.legal_precedents.map((p: any) => `- ${p.case_name}: ${p.relevance}`).join('\n')}\n\n` : ''}

${legalAdvice.next_steps ? `NEXT STEPS:\n${legalAdvice.next_steps.join('\n- ')}\n\n` : ''}

DISCLAIMER: This analysis is provided for informational purposes only and does not constitute legal advice. Consult with a qualified attorney for specific legal guidance.
    `.trim();
  };

  const handleDownload = async () => {
    if (!legalAdvice) return;
    
    setDownloadLoading(true);
    
    try {
      const content = formatAdviceForCopy();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal-consultation-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleStartNew = () => {
    setStep(1);
    setLegalAdvice(null);
    setUploadedFile(null);
    setFormData({
      consultationType: '',
      legalCategory: '',
      consultationDetails: '',
      urgencyLevel: 'medium',
      documentDescription: '',
      specificQuestions: '',
      businessContext: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 border-l border-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Scale className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">AI Legal Advisor</h1>
                  <p className="text-sm text-slate-600">Professional legal consultation and document analysis</p>
                </div>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step >= num
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {num === 4 && step === 4 ? <CheckCircle className="w-4 h-4" /> : num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Consultation Type Selection */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Select Consultation Type
              </h2>
              <p className="text-slate-600">
                Choose the type of legal assistance you need
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, consultationType: type.value })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.consultationType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <type.icon className={`w-8 h-8 mb-3 ${
                    formData.consultationType === type.value ? 'text-blue-600' : 'text-slate-600'
                  }`} />
                  <h3 className="font-semibold text-slate-900 mb-1">{type.label}</h3>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                disabled={!formData.consultationType}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Legal Category & Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Legal Category & Details
              </h2>
              <p className="text-slate-600">
                Specify your legal area and provide consultation details
              </p>
            </div>

            <div className="space-y-6">
              {/* Legal Category Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Legal Category
                </label>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {legalCategories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setFormData({ ...formData, legalCategory: category.value })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.legalCategory === category.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <category.icon className={`w-5 h-5 mb-2 ${
                        formData.legalCategory === category.value ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                      <div className="text-sm font-medium text-slate-900">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Consultation Details *
                </label>
                <textarea
                  value={formData.consultationDetails}
                  onChange={(e) => setFormData({ ...formData, consultationDetails: e.target.value })}
                  placeholder="Please describe your legal situation, questions, or concerns in detail..."
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Business Context */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Context
                </label>
                <textarea
                  value={formData.businessContext}
                  onChange={(e) => setFormData({ ...formData, businessContext: e.target.value })}
                  placeholder="Provide context about your business, industry, or specific circumstances..."
                  className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Specific Questions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Specific Questions
                </label>
                <textarea
                  value={formData.specificQuestions}
                  onChange={(e) => setFormData({ ...formData, specificQuestions: e.target.value })}
                  placeholder="List any specific questions you'd like addressed..."
                  className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Urgency Level
                </label>
                <div className="space-y-2">
                  {urgencyLevels.map((level) => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="radio"
                        name="urgencyLevel"
                        value={level.value}
                        checked={formData.urgencyLevel === level.value}
                        onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                        className="mr-3 text-blue-600"
                      />
                      <span className={`font-medium ${level.color}`}>{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.legalCategory || !formData.consultationDetails.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Document Upload (Optional) */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Document Upload (Optional)
              </h2>
              <p className="text-slate-600">
                Upload relevant documents for analysis and review
              </p>
            </div>

            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  id="document-upload"
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">
                    Drop your document here, or click to browse
                  </p>
                  <p className="text-sm text-slate-600">
                    Supports PDF, DOC, DOCX, TXT files (max 10MB)
                  </p>
                </label>
              </div>

              {/* Uploaded File Display */}
              {uploadedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">{uploadedFile.name}</span>
                      <span className="text-sm text-green-600 ml-2">
                        ({Math.round(uploadedFile.size / 1024)}KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Document Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Description
                </label>
                <textarea
                  value={formData.documentDescription}
                  onChange={(e) => setFormData({ ...formData, documentDescription: e.target.value })}
                  placeholder="Describe the document(s) and what specific aspects you'd like analyzed..."
                  className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get Legal Advice'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Legal Advice Results */}
        {step === 4 && legalAdvice && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Legal Consultation Complete</h2>
                    <p className="text-slate-600">Your AI legal analysis is ready</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                    <span className={copySuccess ? 'text-green-600' : 'text-slate-700'}>
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    disabled={downloadLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {downloadLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={handleStartNew}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    New Consultation
                  </button>
                </div>
              </div>
            </div>

            {/* Legal Analysis Results */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Summary */}
              {legalAdvice.legal_summary && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-blue-600" />
                    Legal Summary
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-slate-800 leading-relaxed">{legalAdvice.legal_summary}</p>
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {legalAdvice.key_findings && legalAdvice.key_findings.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-green-600" />
                    Key Findings
                  </h3>
                  <div className="space-y-3">
                    {legalAdvice.key_findings.map((finding: string, index: number) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-slate-800">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              {legalAdvice.risk_assessment && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Risk Assessment
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-700 font-medium">Risk Level:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        legalAdvice.risk_assessment.risk_level === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : legalAdvice.risk_assessment.risk_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {legalAdvice.risk_assessment.risk_level?.toUpperCase()}
                      </span>
                    </div>
                    {legalAdvice.risk_assessment.risk_factors && (
                      <div>
                        <h4 className="font-medium text-slate-800 mb-2">Risk Factors:</h4>
                        <ul className="space-y-1">
                          {legalAdvice.risk_assessment.risk_factors.map((factor: string, index: number) => (
                            <li key={index} className="text-slate-700 flex items-start">
                              <span className="text-orange-500 mr-2">•</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {legalAdvice.recommendations && legalAdvice.recommendations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {legalAdvice.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-800">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Precedents */}
              {legalAdvice.legal_precedents && legalAdvice.legal_precedents.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Relevant Legal Precedents
                  </h3>
                  <div className="space-y-4">
                    {legalAdvice.legal_precedents.map((precedent: any, index: number) => (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-2">{precedent.case_name}</h4>
                        <p className="text-slate-700 mb-2">{precedent.relevance}</p>
                        {precedent.citation && (
                          <p className="text-sm text-purple-600 font-mono">{precedent.citation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {legalAdvice.next_steps && legalAdvice.next_steps.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Gavel className="w-5 h-5 mr-2 text-indigo-600" />
                    Recommended Next Steps
                  </h3>
                  <div className="space-y-3">
                    {legalAdvice.next_steps.map((step: string, index: number) => (
                      <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-slate-800">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2">Legal Disclaimer</h4>
                    <p className="text-yellow-700 text-sm leading-relaxed">
                      This analysis is provided for informational purposes only and does not constitute legal advice. 
                      The information provided should not be relied upon as a substitute for consultation with a qualified attorney. 
                      Legal advice must be tailored to the specific circumstances of each case, and the law may vary by jurisdiction. 
                      Always consult with a licensed attorney in your jurisdiction for specific legal guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}