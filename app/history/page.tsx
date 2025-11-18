"use client"

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
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
  resultTweets: string[]
  resultLinkedin: string
  resultInstagram?: string
  resultFacebook?: string
  resultEmail: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
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
         <div className="flex-1 flex items-center justify-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2 group">
             <Sparkles className="h-6 w-6 text-emerald-600" />
             <span className="font-bold text-lg">ContentRepurpose</span>
          </Link>
        </div>
         <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Home className="h-5 w-5"/>Dashboard</Link>
          <Link href="/history" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700"><History className="h-5 w-5"/>History</Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Settings className="h-5 w-5"/>Settings</Link>
        </nav>
        <div className="p-4"><Button variant="ghost" onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4"/>Logout</Button></div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-8 py-6">
            <h1 className="text-2xl font-bold">Generation History</h1>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50"
              />
            </div>
        </header>

        <main className="p-8 space-y-6">
          {filteredGenerations.map((item) => (
            <Card key={item.id} className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 flex flex-row justify-between items-start">
                 <div>
                    <CardTitle className="text-base font-medium truncate">{item.sourceUrl}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600"><Trash2 className="h-4 w-4"/></Button>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                
                {/* X / Tweets */}
                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Twitter className="h-4 w-4 text-sky-500"/> Tweets</h4>
                    <div className="space-y-2">
                        {item.resultTweets.map((tweet, idx) => (
                           <div key={idx} className="bg-gray-50 p-3 rounded text-sm relative group">
                                <p>{tweet}</p>
                                <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => handleCopy(tweet, `t-${item.id}-${idx}`)}><Copy className="h-3 w-3"/></Button>
                           </div>
                        ))}
                    </div>
                </div>

                {/* LinkedIn */}
                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Linkedin className="h-4 w-4 text-blue-600"/> LinkedIn</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap relative group">
                        {item.resultLinkedin}
                        <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => handleCopy(item.resultLinkedin, `l-${item.id}`)}><Copy className="h-3 w-3"/></Button>
                    </div>
                </div>

                {/* Instagram */}
                {item.resultInstagram && (
                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Instagram className="h-4 w-4 text-pink-600"/> Instagram</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap relative group">
                        {item.resultInstagram}
                        <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => handleCopy(item.resultInstagram!, `i-${item.id}`)}><Copy className="h-3 w-3"/></Button>
                    </div>
                </div>
                )}

                {/* Facebook */}
                {item.resultFacebook && (
                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Facebook className="h-4 w-4 text-blue-500"/> Facebook</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap relative group">
                        {item.resultFacebook}
                        <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => handleCopy(item.resultFacebook!, `f-${item.id}`)}><Copy className="h-3 w-3"/></Button>
                    </div>
                </div>
                )}
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    </div>
  )
}
