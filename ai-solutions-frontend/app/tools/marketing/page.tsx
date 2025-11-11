"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowLeft, Loader2, Save, Download, Share2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callMarketingTool } from "@/lib/ai-tools";
import { saveResult, exportResult, downloadExportedResult } from "@/lib/results";
import toast, { Toaster } from "react-hot-toast";

export default function MarketingToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    industry: "",
    analysisDepth: "comprehensive",
    region: "North America",
    budgetRange: "$10K-50K",
    targetAudience: "B2B Enterprise",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.industry.trim()) {
      toast.error("Please enter an industry");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await callMarketingTool(formData);

      if (response.error) {
        toast.error(response.error.message || "Failed to generate marketing strategy");
        return;
      }

      setResult(response.data);
      setSavedResultId(null); // Reset saved state for new result
      toast.success("Marketing strategy generated successfully!");
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
        toolName: "Marketing Strategist",
        toolType: "marketing",
        inputData: formData,
        outputData: result,
        title: `Marketing Strategy - ${formData.industry}`,
        description: `Marketing analysis for ${formData.industry} targeting ${formData.targetAudience}`,
        tags: [formData.industry, formData.region, formData.targetAudience],
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
      downloadExportedResult(blob, `marketing_strategy_${formData.industry}.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export result");
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
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

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tool Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-blue-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Marketing Strategist
                </h1>
                <p className="text-gray-600">
                  Generate comprehensive marketing campaigns and strategies
                </p>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Enter Your Business Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry / Business Type *
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g., SaaS, E-commerce, Healthcare, Consulting"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="e.g., B2B Enterprise, B2C Millennials"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Global">Global</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    id="budgetRange"
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="$5K-10K">$5K-10K</option>
                    <option value="$10K-50K">$10K-50K</option>
                    <option value="$50K-100K">$50K-100K</option>
                    <option value="$100K-500K">$100K-500K</option>
                    <option value="$500K+">$500K+</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="analysisDepth" className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Depth
                </label>
                <select
                  id="analysisDepth"
                  name="analysisDepth"
                  value={formData.analysisDepth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="quick">Quick Overview</option>
                  <option value="comprehensive">Comprehensive Analysis</option>
                  <option value="detailed">Detailed Deep Dive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Strategy...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    Generate Marketing Strategy
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Display */}
          {result && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Your Marketing Strategy
              </h2>

              <div className="prose max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Analysis Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {result.parameters && (
                      <>
                        <div>
                          <span className="text-gray-600">Industry:</span>
                          <p className="font-medium text-gray-900">{result.parameters.industry}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Region:</span>
                          <p className="font-medium text-gray-900">{result.parameters.region}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget:</span>
                          <p className="font-medium text-gray-900">{result.parameters.budgetRange}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Audience:</span>
                          <p className="font-medium text-gray-900">{result.parameters.targetAudience}</p>
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

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {/* Save and Export Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !!savedResultId}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      savedResultId
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    {savedResultId ? "Saved" : "Save Result"}
                  </button>

                  <button
                    onClick={() => handleExport('json')}
                    disabled={!savedResultId}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-5 w-5" />
                    Export JSON
                  </button>

                  <button
                    onClick={() => handleExport('txt')}
                    disabled={!savedResultId}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-5 w-5" />
                    Export TXT
                  </button>
                </div>

                {/* Generate Another Button */}
                <button
                  onClick={() => {
                    setResult(null);
                    setSavedResultId(null);
                    setFormData({
                      industry: "",
                      analysisDepth: "comprehensive",
                      region: "North America",
                      budgetRange: "$10K-50K",
                      targetAudience: "B2B Enterprise",
                    });
                  }}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Generate Another Strategy
                </button>

                {/* View History Link */}
                {savedResultId && (
                  <button
                    onClick={() => router.push('/dashboard/history')}
                    className="w-full text-blue-600 hover:text-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Results History
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
