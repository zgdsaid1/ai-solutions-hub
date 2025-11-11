"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callEmailTool, EmailRequest } from "@/lib/ai-tools";
import { saveResult, exportResult, downloadExportedResult } from "@/lib/results";
import toast, { Toaster } from "react-hot-toast";

export default function EmailToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    action: "send_email" as const,
    subject: "",
    to: "",
    emailContent: "",
    tone: "professional",
    campaignType: "newsletter",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!formData.to.trim()) {
      toast.error("Please enter recipient email(s)");
      return;
    }

    if (!formData.emailContent.trim()) {
      toast.error("Please enter email content");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const emailRequest: EmailRequest = {
        action: formData.action,
        subject: formData.subject,
        to: formData.to,
        emailContent: formData.emailContent,
      };

      const response = await callEmailTool(emailRequest);

      if (response.error) {
        toast.error(response.error.message || "Failed to process email request");
        return;
      }

      setResult(response.data);
      setSavedResultId(null); // Reset saved state for new result
      toast.success("Email campaign processed successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Email tool error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      action: "send_email" as const,
      subject: "",
      to: "",
      emailContent: "",
      tone: "professional",
      campaignType: "newsletter",
    });
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const saved = await saveResult({
        toolName: "Email Campaign Manager",
        toolType: "email",
        inputData: formData,
        outputData: result,
        title: `Email Campaign Manager Result - ${new Date().toLocaleDateString()}`,
        description: `Result from Email Campaign Manager`,
        tags: ["email"],
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
      downloadExportedResult(blob, `email_result.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export result");
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
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
              <div className="p-4 bg-red-100 rounded-lg">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Email Campaign Manager
                </h1>
                <p className="text-gray-600">
                  Create and optimize email marketing campaigns
                </p>
              </div>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Action
                    </label>
                    <select
                      name="action"
                      value={formData.action}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="send_email">Send Email</option>
                      <option value="analyze">Analyze Content</option>
                      <option value="categorize">Categorize Emails</option>
                      <option value="respond">Auto-Respond</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Type
                    </label>
                    <select
                      name="campaignType"
                      value={formData.campaignType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="newsletter">Newsletter</option>
                      <option value="promotional">Promotional</option>
                      <option value="transactional">Transactional</option>
                      <option value="announcement">Announcement</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter email subject..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email(s)
                  </label>
                  <input
                    type="email"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    placeholder="Enter recipient email(s) separated by commas..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Content
                  </label>
                  <textarea
                    name="emailContent"
                    value={formData.emailContent}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Enter your email content..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Tone
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing Email Campaign...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Process Email Campaign
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Results</h2>
                  <button
                    onClick={handleReset}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Create New Campaign
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">Campaign Status</h3>
                      <p className="text-green-600 font-medium">
                        {result?.status || 'Processed Successfully'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">Recipients</h3>
                      <p className="text-gray-700">
                        {result?.recipient_count || formData.to.split(',').length} recipient(s)
                      </p>
                    </div>
                  </div>

                  {result?.optimized_content && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Optimized Email Content</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-700">Subject: </span>
                            <span className="text-gray-900">{result.optimized_content.subject}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Content:</span>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="whitespace-pre-line text-gray-800">
                                {result.optimized_content.body}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.recommendations && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Campaign Recommendations</h3>
                      <div className="space-y-3">
                        {result.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Campaign Analytics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Estimated Open Rate:</span>
                        <p className="text-blue-900">{result?.analytics?.open_rate || '25-35%'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Click Rate:</span>
                        <p className="text-blue-900">{result?.analytics?.click_rate || '3-7%'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Deliverability:</span>
                        <p className="text-blue-900">{result?.analytics?.deliverability || '95%+'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Best Send Time:</span>
                        <p className="text-blue-900">{result?.analytics?.best_time || 'Tue 10 AM'}</p>
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