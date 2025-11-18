"use client"

import { useState, useEffect } from "react" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Instagram, Facebook, Mail } from "lucide-react"

interface ResultsDisplayProps {
  results: {
    tweets: string[]
    linkedin: string
    instagram: string
    facebook: string
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

  return (
    <div className="space-y-6">
      
      {/* Tweets / X */}
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
            const isEditing = editingKey === editKey
            return (
              <div key={idx} className="bg-muted p-4 rounded-lg flex justify-between items-start gap-4">
                {isEditing ? (
                  <textarea
                    value={tweet}
                    onChange={(e) => handleTextChange('tweets', e.target.value, idx)}
                    className="flex-1 text-sm w-full min-h-[100px] rounded-md border p-2 bg-background"
                  />
                ) : (
                  <p className="flex-1 text-sm whitespace-pre-wrap">{tweet}</p>
                )}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditingKey(isEditing ? null : editKey)}>
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

      {/* LinkedIn */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            <CardTitle>LinkedIn Post</CardTitle>
          </div>
          <CardDescription>Professional post for your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-4">
            {editingKey === 'linkedin' ? (
              <textarea
                value={editedResults.linkedin}
                onChange={(e) => handleTextChange('linkedin', e.target.value)}
                className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{editedResults.linkedin}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditingKey(editingKey === 'linkedin' ? null : "linkedin")}>
                {editingKey === 'linkedin' ? "Save" : "Edit"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(editedResults.linkedin, "linkedin")}>
                {copied === "linkedin" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instagram */}
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
            {editingKey === 'instagram' ? (
              <textarea
                value={editedResults.instagram}
                onChange={(e) => handleTextChange('instagram', e.target.value)}
                className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{editedResults.instagram}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditingKey(editingKey === 'instagram' ? null : "instagram")}>
                {editingKey === 'instagram' ? "Save" : "Edit"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(editedResults.instagram, "instagram")}>
                {copied === "instagram" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facebook */}
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
            {editingKey === 'facebook' ? (
              <textarea
                value={editedResults.facebook}
                onChange={(e) => handleTextChange('facebook', e.target.value)}
                className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{editedResults.facebook}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditingKey(editingKey === 'facebook' ? null : "facebook")}>
                {editingKey === 'facebook' ? "Save" : "Edit"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(editedResults.facebook, "facebook")}>
                {copied === "facebook" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email */}
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
            {editingKey === 'email' ? (
              <textarea
                value={editedResults.email}
                onChange={(e) => handleTextChange('email', e.target.value)}
                className="text-sm whitespace-pre-wrap w-full min-h-[150px] rounded-md border p-2 bg-background"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{editedResults.email}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditingKey(editingKey === 'email' ? null : "email")}>
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
