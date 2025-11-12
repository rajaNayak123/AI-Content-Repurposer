"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, History, CreditCard, LogOut, Settings, Home, ChevronRight, Twitter, Linkedin, Mail, Copy, Trash2, ExternalLink, Calendar, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HistoryItem {
  id: string
  sourceUrl: string
  createdAt: string
  resultTweets: string[]
  resultLinkedin: string
  resultEmail: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const [generations, setGenerations] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login")
    }

    if (status === "authenticated") {
      fetchHistory()
    }
  }, [status])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/generations")
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to load history")
        setLoading(false)
        return
      }

      setGenerations(data.generations)
    } catch (err) {
      setError("Failed to load history")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredGenerations = generations.filter(item =>
    item.sourceUrl.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          {/* Same sidebar as dashboard */}
        </aside>
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading history...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link 
            href="/dashboard/history" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium group"
          >
            <History className="h-5 w-5" />
            <span>History</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </nav>

        {/* Credits Card */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="p-4 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 text-white mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Credits</span>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">5</span>
              <span className="text-sm opacity-80">/ 5 free</span>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => signOut()}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Generation History</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all your generated content</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {filteredGenerations.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
              <CardContent className="py-16">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-center mx-auto mb-4">
                    <History className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No history yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Start generating content to see your history here
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredGenerations.map((item) => (
                <Card key={item.id} className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                          <CardTitle className="text-base font-medium text-gray-900 dark:text-white truncate">
                            {item.sourceUrl}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">
                    {/* Tweets */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/30 flex items-center justify-center">
                          <Twitter className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Tweets ({item.resultTweets.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {item.resultTweets.map((tweet: string, idx: number) => (
                          <div key={idx} className="group relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <p className="text-sm text-gray-700 dark:text-gray-300 pr-10">{tweet}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(tweet, `tweet-${item.id}-${idx}`)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {copiedId === `tweet-${item.id}-${idx}` && (
                              <span className="absolute top-2 right-12 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                Copied!
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                          <Linkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">LinkedIn Post</h4>
                      </div>
                      <div className="group relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pr-10">{item.resultLinkedin}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.resultLinkedin, `linkedin-${item.id}`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {copiedId === `linkedin-${item.id}` && (
                          <span className="absolute top-2 right-12 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Email Summary</h4>
                      </div>
                      <div className="group relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pr-10">{item.resultEmail}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.resultEmail, `email-${item.id}`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {copiedId === `email-${item.id}` && (
                          <span className="absolute top-2 right-12 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
