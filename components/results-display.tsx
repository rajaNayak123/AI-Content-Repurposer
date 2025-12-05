"use client"

import { useState, useEffect } from "react" 
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Instagram, Facebook, Mail, Eye, Edit3, Send } from "lucide-react"
import PostPreview from "./post-preview"

interface ResultsDisplayProps {
  results: {
    tweets?: string[]
    linkedin?: string
    instagram?: string
    facebook?: string
    email?: string
  }
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const { data: session } = useSession()
  const [copied, setCopied] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<{[key: string]: "edit" | "preview"}>({})
  const [editedResults, setEditedResults] = useState(results)
  const [posting, setPosting] = useState<string | null>(null)
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null)

  useEffect(() => {
    setEditedResults(results)
    setEditingKey(null) 
    // Initialize all to preview mode
    const modes: {[key: string]: "edit" | "preview"} = {}
    if (results.tweets) {
      results.tweets.forEach((_, idx) => {
        modes[`tweet-${idx}`] = "preview"
      })
    }
    if (results.linkedin) modes['linkedin'] = "preview"
    if (results.instagram) modes['instagram'] = "preview"
    if (results.facebook) modes['facebook'] = "preview"
    if (results.email) modes['email'] = "preview"
    setViewMode(modes)
  }, [results])

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleTextChange = (field: keyof typeof editedResults, value: string | string[], index?: number) => {
    setEditedResults(prev => {
      if (Array.isArray(prev[field]) && typeof index === 'number') {
        const newArray = [...(prev[field] as string[])];
        newArray[index] = value as string;
        return { ...prev, [field]: newArray };
      }
      return { ...prev, [field]: value };
    });
  };

  const toggleViewMode = (key: string) => {
    setViewMode(prev => ({
      ...prev,
      [key]: prev[key] === "edit" ? "preview" : "edit"
    }))
  }

  const handlePostToTwitter = async (tweet: string, key: string) => {
    setPosting(key)
    try {
      const response = await fetch("/api/integrations/twitter/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweet }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to post tweet")
      }

      showNotification("Successfully posted to X! 🎉", "success")
    } catch (err: any) {
      showNotification(err.message || "Failed to post to X", "error")
    } finally {
      setPosting(null)
    }
  }

  return (
    <>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-2 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Tweets / X */}
        {editedResults.tweets && Array.isArray(editedResults.tweets) && editedResults.tweets.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5 text-sky-500" />
                <CardTitle>X (Twitter) Thread</CardTitle>
              </div>
              <CardDescription>Engaging tweets with hashtags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editedResults.tweets.map((tweet, idx) => {
                const editKey = `tweet-${idx}`
                const mode = viewMode[editKey] || "preview"
                return (
                  <div key={idx} className="space-y-3">
                    {mode === "preview" ? (
                      <PostPreview
                        content={tweet}
                        platform="twitter"
                        authorName={session?.user?.name || "User"}
                        authorHandle={session?.user?.email?.split("@")[0]}
                      />
                    ) : (
                      <div className="bg-muted p-4 rounded-lg">
                        <textarea
                          value={tweet}
                          onChange={(e) => handleTextChange('tweets', e.target.value, idx)}
                          className="w-full min-h-[100px] rounded-md border p-2 bg-background text-sm"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleViewMode(editKey)}
                      >
                        {mode === "preview" ? (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(tweet, editKey)}
                      >
                        {copied === editKey ? "Copied!" : "Copy"}
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-sky-500 hover:bg-sky-600"
                        onClick={() => handlePostToTwitter(tweet, editKey)}
                        disabled={posting === editKey}
                      >
                        {posting === editKey ? (
                          "Posting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post to X
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* LinkedIn */}
        {editedResults.linkedin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-blue-600" />
                <CardTitle>LinkedIn Post</CardTitle>
              </div>
              <CardDescription>Professional post for your network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {viewMode['linkedin'] === "preview" ? (
                <PostPreview
                  content={editedResults.linkedin}
                  platform="linkedin"
                  authorName={session?.user?.name || "User"}
                />
              ) : (
                <div className="bg-muted p-4 rounded-lg">
                  <textarea
                    value={editedResults.linkedin}
                    onChange={(e) => handleTextChange('linkedin', e.target.value)}
                    className="w-full min-h-[150px] rounded-md border p-2 bg-background text-sm"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleViewMode('linkedin')}
                >
                  {viewMode['linkedin'] === "preview" ? (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(editedResults.linkedin || "", "linkedin")}
                >
                  {copied === "linkedin" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instagram */}
        {editedResults.instagram && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                <CardTitle>Instagram Caption</CardTitle>
              </div>
              <CardDescription>Visual-first caption with hashtags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg space-y-4">
                {viewMode['instagram'] === "edit" ? (
                  <textarea
                    value={editedResults.instagram}
                    onChange={(e) => handleTextChange('instagram', e.target.value)}
                    className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{editedResults.instagram}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleViewMode('instagram')}
                  >
                    {viewMode['instagram'] === "edit" ? "Preview" : "Edit"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(editedResults.instagram || "", "instagram")}
                  >
                    {copied === "instagram" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facebook */}
        {editedResults.facebook && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-500" />
                <CardTitle>Facebook Post</CardTitle>
              </div>
              <CardDescription>Conversational community post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg space-y-4">
                {viewMode['facebook'] === "edit" ? (
                  <textarea
                    value={editedResults.facebook}
                    onChange={(e) => handleTextChange('facebook', e.target.value)}
                    className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{editedResults.facebook}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleViewMode('facebook')}
                  >
                    {viewMode['facebook'] === "edit" ? "Preview" : "Edit"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(editedResults.facebook || "", "facebook")}
                  >
                    {copied === "facebook" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email */}
        {editedResults.email && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                <CardTitle>Email Summary</CardTitle>
              </div>
              <CardDescription>Newsletter teaser</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg space-y-4">
                {viewMode['email'] === "edit" ? (
                  <textarea
                    value={editedResults.email}
                    onChange={(e) => handleTextChange('email', e.target.value)}
                    className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{editedResults.email}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleViewMode('email')}
                  >
                    {viewMode['email'] === "edit" ? "Preview" : "Edit"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(editedResults.email || "", "email")}
                  >
                    {copied === "email" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
