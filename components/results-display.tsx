"use client"

import { useState, useEffect } from "react" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ResultsDisplayProps {
  results: {
    tweets: string[]
    linkedin: string
    email: string
  }
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editedResults, setEditedResults] = useState(results)

  useEffect(() => {
    setEditedResults(results)
    setEditingKey(null) 
  }, [results])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }
  const handleTweetChange = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
    const newTweets = [...editedResults.tweets]
    newTweets[index] = e.target.value
    setEditedResults(prev => ({ ...prev, tweets: newTweets }))
  }

  const handleLinkedinChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedResults(prev => ({ ...prev, linkedin: e.target.value }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedResults(prev => ({ ...prev, email: e.target.value }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generated Content</h2>
      <Card>
        <CardHeader>
          <CardTitle>Tweets</CardTitle>
          <CardDescription>5 short, catchy tweets with hashtags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editedResults.tweets.map((tweet, idx) => {
            const editKey = `tweet-${idx}`
            const isEditing = editingKey === editKey
            return (
              <div key={idx} className="bg-muted p-4 rounded-lg flex justify-between items-start gap-4">
                {isEditing ? (
                  <textarea
                    value={tweet}
                    onChange={(e) => handleTweetChange(e, idx)}
                    className="flex-1 text-sm w-full min-h-[100px] rounded-md border p-2 bg-background dark:bg-gray-800"
                  />
                ) : (
                  <p className="flex-1 text-sm">{tweet}</p>
                )}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setEditingKey(isEditing ? null : editKey)}>
                    {isEditing ? "Save" : "Edit"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(tweet, editKey)}>
                    {copied === editKey ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Post</CardTitle>
          <CardDescription>Professional post for your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-4">
            {editingKey === 'linkedin' ? (
              <textarea
                value={editedResults.linkedin}
                onChange={handleLinkedinChange}
                className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background dark:bg-gray-800"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{editedResults.linkedin}</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingKey(editingKey === 'linkedin' ? null : "linkedin")}>
                {editingKey === 'linkedin' ? "Save" : "Edit"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(editedResults.linkedin, "linkedin")}>
                {copied === "linkedin" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Email Summary</CardTitle>
          <CardDescription>100-word summary for your newsletter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-4">
            {editingKey === 'email' ? (
              <textarea
                value={editedResults.email}
                onChange={handleEmailChange}
                className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background dark:bg-gray-800"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{editedResults.email}</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingKey(editingKey === 'email' ? null : "email")}>
                {editingKey === 'email' ? "Save" : "Edit"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(editedResults.email, "email")}>
                {copied === "email" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
