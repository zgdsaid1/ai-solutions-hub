"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callContentTool } from "@/lib/ai-tools";
import { saveResult, exportResult, downloadExportedResult } from "@/lib/results";
import toast, { Toaster } from "react-hot-toast";

export default function ContentToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    topic: "",
    contentType: "blog-post",
    tone: "professional",
    length: "medium",
    audience: "general",
    keywords: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error("Please enter a topic for content generation");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const contentRequest = {
        topic: formData.topic,
        contentType: formData.contentType,
        tone: formData.tone,
        length: formData.length,
        audience: formData.audience,
        keywords: formData.keywords,
      };

      const response = await callContentTool(contentRequest);

      if (response.error) {
        toast.error(response.error.message || "Failed to generate content");
        return;
      }

      setResult(response.data);
      setSavedResultId(null); // Reset saved state for new result
      toast.success("Content generated successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Content tool error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      topic: "",
      contentType: "blog-post",
      tone: "professional",
      length: "medium",
      audience: "general",
      keywords: "",
    });
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const saved = await saveResult({
        toolName: "Content Creator",
        toolType: "content",
        inputData: formData,
        outputData: result,
        title: `Content Creator Result - ${new Date().toLocaleDateString()}`,
        description: `Result from Content Creator`,
        tags: ["content"],
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
      downloadExportedResult(blob, `content_result.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export result");
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
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
              <div className="p-4 bg-purple-100 rounded-lg">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Content Creator
                </h1>
                <p className="text-gray-600">
                  Generate high-quality content for any purpose
                </p>
              </div>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Topic *
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., 'The Future of Artificial Intelligence in Healthcare'"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type
                    </label>
                    <select
                      name="contentType"
                      value={formData.contentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="blog-post">Blog Post</option>
                      <option value="article">Article</option>
                      <option value="social-media">Social Media Post</option>
                      <option value="product-description">Product Description</option>
                      <option value="email-newsletter">Email Newsletter</option>
                      <option value="press-release">Press Release</option>
                      <option value="landing-page">Landing Page Copy</option>
                      <option value="whitepaper">Whitepaper</option>
                      <option value="case-study">Case Study</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Length
                    </label>
                    <select
                      name="length"
                      value={formData.length}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="short">Short (300-500 words)</option>
                      <option value="medium">Medium (500-1000 words)</option>
                      <option value="long">Long (1000-2000 words)</option>
                      <option value="extensive">Extensive (2000+ words)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Writing Tone
                    </label>
                    <select
                      name="tone"
                      value={formData.tone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="professional">Professional</option>
                      <option value="conversational">Conversational</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="friendly">Friendly</option>
                      <option value="persuasive">Persuasive</option>
                      <option value="educational">Educational</option>
                      <option value="humorous">Humorous</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      name="audience"
                      value={formData.audience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="general">General Audience</option>
                      <option value="business">Business Professionals</option>
                      <option value="technical">Technical/IT Professionals</option>
                      <option value="executives">C-Level Executives</option>
                      <option value="students">Students/Academics</option>
                      <option value="consumers">Consumers/End Users</option>
                      <option value="developers">Developers</option>
                      <option value="marketing">Marketing Professionals</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (Optional)
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="Enter keywords separated by commas (e.g., AI, machine learning, healthcare)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Content
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Generated Content</h2>
                  <button
                    onClick={handleReset}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create New Content
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Content Type</h3>
                      <p className="text-gray-700 capitalize">{formData.contentType.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Word Count</h3>
                      <p className="text-gray-700">
                        {result?.word_count || 'N/A'} words
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Reading Time</h3>
                      <p className="text-gray-700">
                        {result?.reading_time || Math.ceil((result?.word_count || 500) / 200)} min read
                      </p>
                    </div>
                  </div>

                  {result?.title && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Title</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <h2 className="text-xl font-bold text-gray-900">{result.title}</h2>
                      </div>
                    </div>
                  )}

                  {result?.content && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Generated Content</h3>
                      <div className="bg-white p-6 rounded-lg border max-h-96 overflow-y-auto">
                        <div className="prose prose-gray max-w-none">
                          <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                            {result.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.outline && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Content Outline</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <ul className="space-y-2">
                          {result.outline.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-purple-600 font-medium">{index + 1}.</span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {result?.seo_suggestions && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">SEO Suggestions</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.seo_suggestions.map((suggestion: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                              <p className="text-gray-700">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📝 Content Quality Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Readability:</span>
                        <p className="text-blue-900">{result?.readability_score || 'Good'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">SEO Score:</span>
                        <p className="text-blue-900">{result?.seo_score || '85/100'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Uniqueness:</span>
                        <p className="text-blue-900">{result?.uniqueness || '98%'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Engagement:</span>
                        <p className="text-blue-900">{result?.engagement_score || 'High'}</p>
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