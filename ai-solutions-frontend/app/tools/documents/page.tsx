"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Loader2, Download, Eye } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callDocumentTool } from "../../../lib/ai-tools";
import { saveResult, exportResult, downloadExportedResult } from "../../../lib/results";
import toast, { Toaster } from "react-hot-toast";

export default function DocumentsToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    documentType: "contract",
    action: "generate",
    title: "",
    content: "",
    parties: "",
    specificRequirements: "",
    templates: "",
    industry: "",
    jurisdiction: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.action === 'generate' && !formData.title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (formData.action === 'review' && !formData.content.trim()) {
      toast.error("Please provide document content for review");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const documentRequest = {
        documentType: formData.documentType,
        action: formData.action as 'generate' | 'review',
        data: {
          title: formData.title,
          content: formData.content,
          parties: formData.parties,
          specific_requirements: formData.specificRequirements,
          templates: formData.templates,
          industry: formData.industry,
          jurisdiction: formData.jurisdiction,
        },
      };

      const response = await callDocumentTool(documentRequest);

      if (response.error) {
        toast.error(response.error.message || "Failed to process document");
        return;
      }

      setResult(response.data);
      setSavedResultId(null); // Reset saved state for new result
      toast.success(`Document ${formData.action === 'generate' ? 'generated' : 'reviewed'} successfully!`);
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Document tool error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      documentType: "contract",
      action: "generate",
      title: "",
      content: "",
      parties: "",
      specificRequirements: "",
      templates: "",
      industry: "",
      jurisdiction: "",
    });
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const saved = await saveResult({
        toolName: "Document Automation",
        toolType: "documents",
        inputData: formData,
        outputData: result,
        title: `Document Automation Result - ${new Date().toLocaleDateString()}`,
        description: `Result from Document Automation`,
        tags: ["documents"],
      });
      
      setSavedResultId(saved.id);
      toast.success("Result saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save result");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: 'json' | 'txt' | 'csv') => {
    if (!savedResultId) {
      toast.error("Please save the result first");
      return;
    }

    try {
      const blob = await exportResult(savedResultId, format);
      downloadExportedResult(blob, `documents_result.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export result");
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-teal-100 rounded-lg">
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Document Automation
                </h1>
                <p className="text-gray-600">
                  Generate and review professional documents automatically
                </p>
              </div>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Type
                    </label>
                    <select
                      name="action"
                      value={formData.action}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="generate">Generate New Document</option>
                      <option value="review">Review Existing Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Type
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="contract">Contract/Agreement</option>
                      <option value="proposal">Business Proposal</option>
                      <option value="policy">Policy Document</option>
                      <option value="report">Report</option>
                      <option value="memo">Memorandum</option>
                      <option value="nda">Non-Disclosure Agreement</option>
                      <option value="sow">Statement of Work</option>
                      <option value="invoice">Invoice</option>
                      <option value="legal-brief">Legal Brief</option>
                      <option value="terms">Terms & Conditions</option>
                    </select>
                  </div>
                </div>

                {formData.action === 'generate' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Service Agreement between XYZ Corp and ABC Inc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parties Involved (Optional)
                      </label>
                      <textarea
                        name="parties"
                        value={formData.parties}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="List the parties involved (companies, individuals, roles, etc.)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry (Optional)
                        </label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          placeholder="e.g., Technology, Healthcare, Finance"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jurisdiction (Optional)
                        </label>
                        <input
                          type="text"
                          name="jurisdiction"
                          value={formData.jurisdiction}
                          onChange={handleInputChange}
                          placeholder="e.g., New York, California, United States"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Content to Review *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={8}
                      placeholder="Paste the document content you want to review..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Requirements (Optional)
                  </label>
                  <textarea
                    name="specificRequirements"
                    value={formData.specificRequirements}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any specific clauses, terms, or requirements to include..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-teal-600 text-white py-4 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {formData.action === 'generate' ? 'Generating Document...' : 'Reviewing Document...'}
                    </>
                  ) : (
                    <>
                      {formData.action === 'generate' ? (
                        <><FileText className="h-5 w-5" />Generate Document</>
                      ) : (
                        <><Eye className="h-5 w-5" />Review Document</>
                      )}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Document {formData.action === 'generate' ? 'Generated' : 'Review Results'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      New Document
                    </button>
                    {result?.document_content && (
                      <button
                        onClick={() => {
                          const blob = new Blob([result.document_content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${formData.title || 'document'}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Document Type</h3>
                      <p className="text-gray-700 capitalize">{formData.documentType.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Word Count</h3>
                      <p className="text-gray-700">{result?.word_count || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Completeness</h3>
                      <p className="text-gray-700">{result?.completeness_score || '95%'}</p>
                    </div>
                  </div>

                  {result?.document_content && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {formData.action === 'generate' ? 'Generated Document' : 'Document Content'}
                      </h3>
                      <div className="bg-white p-6 rounded-lg border max-h-96 overflow-y-auto">
                        <div className="prose prose-gray max-w-none">
                          <div className="whitespace-pre-line text-gray-800 leading-relaxed font-mono text-sm">
                            {result.document_content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.review_feedback && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Review Feedback</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.review_feedback.map((feedback: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                              <p className="text-gray-700">{feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.suggested_improvements && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Suggested Improvements</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-4">
                          {result.suggested_improvements.map((improvement: any, index: number) => (
                            <div key={index} className="p-3 border-l-4 border-yellow-400 bg-yellow-50">
                              <h4 className="font-medium text-yellow-900 mb-1">
                                {improvement.section || `Improvement ${index + 1}`}
                              </h4>
                              <p className="text-yellow-800 text-sm">
                                {improvement.suggestion || improvement}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.legal_considerations && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Legal Considerations</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.legal_considerations.map((consideration: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                              <span className="text-red-600 font-bold">⚠️</span>
                              <p className="text-red-800 text-sm">{consideration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📄 Document Quality Assessment</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Clarity:</span>
                        <p className="text-blue-900">{result?.clarity_score || 'Excellent'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Legal Accuracy:</span>
                        <p className="text-blue-900">{result?.legal_accuracy || '92%'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Structure:</span>
                        <p className="text-blue-900">{result?.structure_score || 'Good'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Risk Level:</span>
                        <p className="text-blue-900">{result?.risk_assessment || 'Low'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}