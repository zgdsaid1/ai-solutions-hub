"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, ArrowLeft, Loader2, FileText } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callLegalTool } from "../../../lib/ai-tools";
import { saveResult, exportResult, downloadExportedResult } from "../../../lib/results";
import toast, { Toaster } from "react-hot-toast";

export default function LegalToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    documentType: "Contract",
    documentContent: "",
    analysisType: "Compliance Check",
    priorityLevel: "High",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.documentContent.trim()) {
      toast.error("Please enter document content");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await callLegalTool(formData);

      if (response.error) {
        toast.error(response.error.message || "Failed to analyze document");
        return;
      }

      setResult(response.data);
      setSavedResultId(null); // Reset saved state for new result
      toast.success("Document analyzed successfully!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const saved = await saveResult({
        toolName: "Legal Document Analyzer",
        toolType: "legal",
        inputData: formData,
        outputData: result,
        title: `Legal Document Analyzer Result - ${new Date().toLocaleDateString()}`,
        description: `Result from Legal Document Analyzer`,
        tags: ["legal"],
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
      downloadExportedResult(blob, `legal_result.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export result");
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tool Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-purple-100 rounded-lg">
                <Scale className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Legal Document Analyzer
                </h1>
                <p className="text-gray-600">
                  Analyze contracts and legal documents with AI precision
                </p>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Enter Document Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Contract">Contract</option>
                    <option value="NDA">NDA</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Terms of Service">Terms of Service</option>
                    <option value="Privacy Policy">Privacy Policy</option>
                    <option value="License Agreement">License Agreement</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Type
                  </label>
                  <select
                    id="analysisType"
                    name="analysisType"
                    value={formData.analysisType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Compliance Check">Compliance Check</option>
                    <option value="Risk Assessment">Risk Assessment</option>
                    <option value="Terms Analysis">Terms Analysis</option>
                    <option value="Full Review">Full Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="priorityLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  id="priorityLevel"
                  name="priorityLevel"
                  value={formData.priorityLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="documentContent" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Content *
                </label>
                <textarea
                  id="documentContent"
                  name="documentContent"
                  value={formData.documentContent}
                  onChange={handleInputChange}
                  placeholder="Paste your legal document text here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Paste the full text of your legal document for comprehensive analysis
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Analyze Document
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Display */}
          {result && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Scale className="h-6 w-6 text-purple-600" />
                Legal Analysis Report
              </h2>

              <div className="prose max-w-none">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Document Overview</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {result.parameters && (
                      <>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <p className="font-medium text-gray-900">{result.parameters.documentType}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Analysis:</span>
                          <p className="font-medium text-gray-900">{result.parameters.analysisType}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Priority:</span>
                          <p className="font-medium text-gray-900">{result.parameters.priorityLevel}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap text-gray-800">
                  {result.analysis}
                </div>

                {result.usage && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Tokens Used:</span> {result.usage.tokensUsed}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ${result.usage.cost?.toFixed(4)}
                      </div>
                      <div>
                        <span className="font-medium">Engine:</span> {result.usage.engine}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setFormData({
                    documentType: "Contract",
                    documentContent: "",
                    analysisType: "Compliance Check",
                    priorityLevel: "High",
                  });
                }}
                className="mt-6 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Analyze Another Document
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
