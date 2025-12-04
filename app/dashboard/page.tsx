"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ContentForm from "@/components/content-form"
import ResultsDisplay from "@/components/results-display"
import { Sparkles, History, CreditCard, LogOut, Settings, Home, ChevronRight } from "lucide-react"

interface GenerationResult {
  tweets?: string[]
  linkedin?: string
  instagram?: string 
  facebook?: string  
  email?: string
}

export default function DashboardPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GenerationResult | null>(null)
  const [credits, setCredits] = useState(0)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData()
    }
  }, [status])

  const fetchUserData = async () => {
    try {
      setCreditsLoading(true)
      const response = await fetch("/api/settings")
      if (!response.ok) throw new Error("Failed to fetch user data")
      
      const data = await response.json()
      setCredits(data.user.credits)
    } catch (err) {
      setError("Could not load credit balance.")
    } finally {
      setCreditsLoading(false)
    }
  }

  if (status === "unauthenticated") {
    redirect("/auth/login")
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-slate-100 dark:from-gray-950 dark:to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  const handleGenerate = async (url: string, tone: string, platforms: string[]) => {
    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, tone, platforms }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Generation failed")
        setLoading(false)
        return
      }

      setResults(data.result)
      setCredits(data.credits)
      await updateSession({ credits: data.credits });
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-base font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                ContentRepurpose
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">AI-Powered</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium group"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link 
            href="/history" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
          >
            <History className="h-5 w-5" />
            <span>History</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link 
            href="/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="p-4 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 text-white mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Credits</span>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{creditsLoading ? '...' : credits}</span>
              <span className="text-sm opacity-80">available</span>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer"
              onClick={() => router.push('/settings')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
            </div>
            <Button variant="ghost" onClick={() => signOut()} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transform your content into engaging social media posts
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-xl mb-8 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 border-b border-gray-200 dark:border-gray-800 pb-6">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Generate Your Social Content
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                  Paste your YouTube video URL or blog post link and select your platforms ✨
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <ContentForm onSubmit={handleGenerate} loading={loading} credits={credits} />
            </CardContent>
          </Card>

          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Generated Content</h2>
                <Link href="/history">
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
              </div>
              <ResultsDisplay results={results} />
            </div>
          )}

          {!results && !loading && (
             <div className="relative">
             <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl blur-3xl" />
             <Card className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
               <CardContent className="py-16">
                 <div className="text-center max-w-lg mx-auto">
                   <div className="relative inline-flex mb-6">
                     <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-30 animate-pulse" />
                     <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-center">
                       <Sparkles className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                     </div>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                     Ready to Transform Your Content?
                   </h3>
                   <p className="text-gray-600 dark:text-gray-400 mb-6">
                     Paste a YouTube video or blog post URL above, select your platforms, and watch AI generate content in seconds.
                   </p>
                 </div>
               </CardContent>
             </Card>
           </div>
          )}
        </main>
      </div>
    </div>
  );
}
