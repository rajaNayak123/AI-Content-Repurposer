"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, History, CreditCard, LogOut, Settings, Home, ChevronRight, 
  Twitter, Linkedin, Instagram, Facebook, Mail, Copy, Trash2, Search, 
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface HistoryItem {
  id: string
  sourceUrl: string
  createdAt: string
  resultTweets?: string[] | null
  resultLinkedin?: string | null
  resultInstagram?: string | null
  resultFacebook?: string | null
  resultEmail?: string | null
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [generations, setGenerations] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0) 
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login")
    }

    if (status === "authenticated") {
      fetchHistory()
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

  const fetchHistory = async () => {
    try {
      setLoading(true)
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

  // Helper function to normalize tweet to string
  const normalizeTweet = (tweet: any): string => {
    if (typeof tweet === 'string') {
      return tweet;
    }
    if (typeof tweet === 'object' && tweet !== null) {
      // Handle {text: "...", hashtags: "..."} format
      if (tweet.text) {
        return tweet.hashtags ? `${tweet.text} ${tweet.hashtags}` : tweet.text;
      }
      // Handle {tweet: "..."} format
      if (tweet.tweet) {
        return tweet.tweet;
      }
      // Fallback: stringify the object
      return JSON.stringify(tweet);
    }
    return String(tweet);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      setError("")
      const response = await fetch(`/api/generations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete item")

      setGenerations((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting.")
    }
  }

  const filteredGenerations = generations.filter(item =>
    item.sourceUrl.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === "loading" || loading || creditsLoading) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
         {/* Loading Spinner */}
         <div className="flex-1 flex items-center justify-center">
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link 
            href="/history" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium group"
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
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Generation History</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">View and manage your past content generations</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800"
              />
            </div>
        </header>

        <main className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {filteredGenerations.length === 0 && (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
              <CardContent className="py-16 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No generations found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery ? "Try a different search term" : "Start by generating some content on the dashboard"}
                </p>
                {!searchQuery && (
                  <Link href="/dashboard">
                    <Button>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {filteredGenerations.map((item) => {
            // Normalize tweets array to strings
            const normalizedTweets = item.resultTweets && Array.isArray(item.resultTweets)
              ? item.resultTweets.map(tweet => normalizeTweet(tweet))
              : [];

            return (
              <Card key={item.id} className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 flex flex-row justify-between items-start">
                   <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-medium truncate text-gray-900 dark:text-white">
                        {item.sourceUrl}
                      </CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                   </div>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => handleDelete(item.id)} 
                     className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                   >
                     <Trash2 className="h-4 w-4"/>
                   </Button>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  
                  {/* X / Tweets */}
                  {normalizedTweets.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <Twitter className="h-4 w-4 text-sky-500"/> X (Twitter)
                      </h4>
                      <div className="space-y-2">
                          {normalizedTweets.map((tweet, idx) => (
                             <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm relative group">
                                  <p className="pr-8 text-gray-700 dark:text-gray-300">{tweet}</p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0" 
                                    onClick={() => handleCopy(tweet, `t-${item.id}-${idx}`)}
                                  >
                                    {copiedId === `t-${item.id}-${idx}` ? (
                                      <span className="text-xs text-emerald-600">✓</span>
                                    ) : (
                                      <Copy className="h-3 w-3"/>
                                    )}
                                  </Button>
                             </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {item.resultLinkedin && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <Linkedin className="h-4 w-4 text-blue-600"/> LinkedIn
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm whitespace-pre-wrap relative group">
                          <p className="pr-8 text-gray-700 dark:text-gray-300">{item.resultLinkedin}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0" 
                            onClick={() => handleCopy(item.resultLinkedin!, `l-${item.id}`)}
                          >
                            {copiedId === `l-${item.id}` ? (
                              <span className="text-xs text-emerald-600">✓</span>
                            ) : (
                              <Copy className="h-3 w-3"/>
                            )}
                          </Button>
                      </div>
                    </div>
                  )}

                  {/* Instagram */}
                  {item.resultInstagram && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <Instagram className="h-4 w-4 text-pink-600"/> Instagram
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm whitespace-pre-wrap relative group">
                          <p className="pr-8 text-gray-700 dark:text-gray-300">{item.resultInstagram}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0" 
                            onClick={() => handleCopy(item.resultInstagram!, `i-${item.id}`)}
                          >
                            {copiedId === `i-${item.id}` ? (
                              <span className="text-xs text-emerald-600">✓</span>
                            ) : (
                              <Copy className="h-3 w-3"/>
                            )}
                          </Button>
                      </div>
                    </div>
                  )}

                  {/* Facebook */}
                  {item.resultFacebook && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <Facebook className="h-4 w-4 text-blue-500"/> Facebook
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm whitespace-pre-wrap relative group">
                          <p className="pr-8 text-gray-700 dark:text-gray-300">{item.resultFacebook}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0" 
                            onClick={() => handleCopy(item.resultFacebook!, `f-${item.id}`)}
                          >
                            {copiedId === `f-${item.id}` ? (
                              <span className="text-xs text-emerald-600">✓</span>
                            ) : (
                              <Copy className="h-3 w-3"/>
                            )}
                          </Button>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {item.resultEmail && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                        <Mail className="h-4 w-4 text-purple-600"/> Email
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm whitespace-pre-wrap relative group">
                          <p className="pr-8 text-gray-700 dark:text-gray-300">{item.resultEmail}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0" 
                            onClick={() => handleCopy(item.resultEmail!, `e-${item.id}`)}
                          >
                            {copiedId === `e-${item.id}` ? (
                              <span className="text-xs text-emerald-600">✓</span>
                            ) : (
                              <Copy className="h-3 w-3"/>
                            )}
                          </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </main>
      </div>
    </div>
  )
}
