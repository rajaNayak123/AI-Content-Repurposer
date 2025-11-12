"use client"

import { useState } from "react"
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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generated Content</h2>

      {/* Tweets */}
      <Card>
        <CardHeader>
          <CardTitle>Tweets</CardTitle>
          <CardDescription>5 short, catchy tweets with hashtags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.tweets.map((tweet, idx) => (
            <div key={idx} className="bg-muted p-4 rounded-lg flex justify-between items-start gap-4">
              <p className="flex-1 text-sm">{tweet}</p>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(tweet, `tweet-${idx}`)}>
                {copied === `tweet-${idx}` ? "Copied!" : "Copy"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* LinkedIn Post */}
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Post</CardTitle>
          <CardDescription>Professional post for your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <p className="text-sm whitespace-pre-wrap">{results.linkedin}</p>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(results.linkedin, "linkedin")}>
              {copied === "linkedin" ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Email Summary</CardTitle>
          <CardDescription>100-word summary for your newsletter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <p className="text-sm whitespace-pre-wrap">{results.email}</p>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(results.email, "email")}>
              {copied === "email" ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
