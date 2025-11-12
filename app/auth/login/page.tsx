"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, User, Check, Zap, Shield, Clock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignUp) {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters")
          setLoading(false)
          return
        }

        // Sign up logic
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Sign up failed")
          setLoading(false)
          return
        }

        // Auto sign in after signup
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push("/dashboard")
        }
      } else {
        // Sign in logic
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (!result?.ok) {
          setError(result?.error || "Invalid email or password")
          setLoading(false)
          return
        }

        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setFormData({ name: "", email: "", password: "", confirmPassword: "" })
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        </div>

        <div className="relative z-10 max-w-md text-white w-full">
          {/* Sign In Content */}
          <div
            className={`transition-all duration-700 ease-in-out transform ${
              isSignUp 
                ? 'opacity-0 scale-95 absolute inset-0 pointer-events-none' 
                : 'opacity-100 scale-100'
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">AI-Powered Content Tool</span>
                </div>
                <h2 className="text-4xl font-bold leading-tight">
                  Transform your content into multiple formats instantly
                </h2>
                <p className="text-lg text-white/90">
                  Save 10+ hours every week by repurposing YouTube videos and blog posts into social media content.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instant Generation</h3>
                    <p className="text-sm text-white/80">Get 5 tweets, LinkedIn post, and email summary in seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure & Private</h3>
                    <p className="text-sm text-white/80">Your data is encrypted and never shared with third parties</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Save Time</h3>
                    <p className="text-sm text-white/80">Reduce content creation time from hours to minutes</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div className="space-y-1">
                  <p className="text-3xl font-bold">100+</p>
                  <p className="text-sm text-white/80">Active Users</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">100+</p>
                  <p className="text-sm text-white/80">Content Created</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">3.9/5</p>
                  <p className="text-sm text-white/80">User Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Content */}
          <div
            className={`transition-all duration-700 ease-in-out transform ${
              isSignUp 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
            }`}
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Get Started Free</span>
                </div>
                <h2 className="text-4xl font-bold leading-tight">
                  Join thousands of creators saving time
                </h2>
                <p className="text-lg text-white/90">
                  Start with 5 free credits and experience the power of AI content repurposing. No credit card required.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="text-white/90">5 free credits on signup</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="text-white/90">No credit card required</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="text-white/90">Access to all features</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="text-white/90">Cancel anytime</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div className="space-y-1">
                  <p className="text-3xl font-bold">100+</p>
                  <p className="text-sm text-white/80">Happy Users</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">90%</p>
                  <p className="text-sm text-white/80">Satisfaction</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-sm text-white/80">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ContentRepurpose.ai
              </span>
            </Link>
          </div>

          {/* Sliding Forms Container */}
          <div className="relative min-h-[500px]">
            {/* Sign In Form */}
            <div
              className={`transition-all duration-700 ease-in-out transform ${
                isSignUp 
                  ? 'opacity-0 scale-95 absolute inset-0 pointer-events-none' 
                  : 'opacity-100 scale-100'
              }`}
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
                  <p className="text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <Link 
                        href="/auth/forgot-password"
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Sign Up Form */}
            <div
              className={`transition-all duration-700 ease-in-out transform ${
                isSignUp 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'
              }`}
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
                  <p className="text-gray-600 dark:text-gray-400">Sign up to start repurposing content</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-emerald-500"
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email-signup" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email-signup"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password-signup" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password-signup"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-emerald-500"
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create account
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          {/* Toggle Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={toggleMode}
              className="cursor-pointer font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {isSignUp ? "Sign in" : "Sign up for free"}
            </button>
          </p>
          </div>

        </div>
      </div>
    </div>
  )
}
