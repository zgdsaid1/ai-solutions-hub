"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Brain, LogOut, User, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

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

  return (
    <ProtectedRoute>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">AI Solutions Hub</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome to AI Solutions Hub!
              </h1>
              <p className="text-lg text-gray-600">
                You have successfully logged in
              </p>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Your Account
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Email:</span>
                  <span>{user?.email}</span>
                </div>
                {user?.user_metadata?.full_name && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Name:</span>
                    <span>{user.user_metadata.full_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium">
                Your authentication system is working perfectly!
              </p>
              <p className="text-green-600 text-sm mt-1">
                All auth flows are operational and ready to use
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Login</h3>
              <p className="text-sm text-gray-600">Email & password authentication</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Signup</h3>
              <p className="text-sm text-gray-600">Quick account creation</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Password Reset</h3>
              <p className="text-sm text-gray-600">Email-based recovery</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
