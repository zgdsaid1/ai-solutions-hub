"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Brain, 
  LogOut, 
  User,
  TrendingUp,
  Scale,
  Sparkles,
  BarChart3,
  Briefcase,
  MessageCircle,
  Mail,
  FileText
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  route: string;
}

const aiTools: AITool[] = [
  {
    id: "marketing",
    name: "Marketing Strategist",
    description: "Generate comprehensive marketing campaigns and strategies",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    route: "/tools/marketing"
  },
  {
    id: "legal",
    name: "Legal Document Analyzer",
    description: "Analyze contracts and legal documents with AI precision",
    icon: Scale,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    route: "/tools/legal"
  },
  {
    id: "content",
    name: "Content Creator",
    description: "Create engaging content for all marketing channels",
    icon: Sparkles,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    route: "/tools/content"
  },
  {
    id: "data",
    name: "Data Analysis Engine",
    description: "Extract insights from business data automatically",
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-100",
    route: "/tools/data"
  },
  {
    id: "sales",
    name: "Sales Assistant",
    description: "AI-powered sales strategies and lead generation",
    icon: Briefcase,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    route: "/tools/sales"
  },
  {
    id: "support",
    name: "Customer Support Bot",
    description: "Intelligent customer service automation",
    icon: MessageCircle,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    route: "/tools/support"
  },
  {
    id: "email",
    name: "Email Campaign Manager",
    description: "Create and optimize email marketing campaigns",
    icon: Mail,
    color: "text-red-600",
    bgColor: "bg-red-100",
    route: "/tools/email"
  },
  {
    id: "documents",
    name: "Document Automation",
    description: "Automate document creation and processing",
    icon: FileText,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    route: "/tools/documents"
  }
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  const handleToolClick = (route: string) => {
    router.push(route);
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Solutions Hub
                  </h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.email?.split('@')[0]}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your AI Tools
            </h2>
            <p className="text-gray-600">
              Select a tool to start transforming your business with AI
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${tool.bgColor} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-7 w-7 ${tool.color}`} />
                    </div>

                    {/* Tool Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tool.description}
                    </p>

                    {/* Use Tool Button */}
                    <button
                      onClick={() => handleToolClick(tool.route)}
                      className={`w-full px-4 py-2.5 ${tool.color} bg-gradient-to-r from-${tool.color.replace('text-', '')}/10 to-${tool.color.replace('text-', '')}/5 hover:from-${tool.color.replace('text-', '')}/20 hover:to-${tool.color.replace('text-', '')}/10 rounded-lg font-medium transition-all duration-200 hover:shadow-md`}
                    >
                      Use Tool
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Getting Started
                </h3>
                <p className="text-gray-600 mb-3">
                  Each AI tool is designed to solve specific business challenges. Click on any tool above to access its interface and start generating AI-powered solutions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    8 AI Tools Available
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure Access
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Professional Grade
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
