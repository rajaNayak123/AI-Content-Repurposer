"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ContentFormProps {
  onSubmit: (url: string) => Promise<void>
  loading: boolean
  credits: number
}

export default function ContentForm({ onSubmit, loading, credits }: ContentFormProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      return (
        hostname.includes("youtube.com") ||
        hostname.includes("youtu.be") ||
        hostname.includes("blog") ||
        hostname.includes("medium.com") ||
        hostname.includes("dev.to") ||
        hostname.includes("hashnode.com")
      )
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid YouTube or blog URL")
      return
    }

    if (credits <= 0) {
      setError("You are out of credits")
      return
    }

    await onSubmit(url)
    setUrl("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
      <Input
  type="url"
  placeholder="Paste YouTube link or blog URL..."
  value={url}
  onChange={(e) => setUrl(e.target.value)}
  disabled={loading || credits <= 0}
  className={`
    h-12
    flex-1
    rounded-2xl
    border
    border-gray-300
    bg-white/80
    px-4
    py-3
    text-base
    text-gray-700
    placeholder-gray-400
    shadow-sm
    backdrop-blur-sm
    transition-all
    duration-300
    ease-in-out
    focus:border-blue-500
    focus:ring-2
    focus:ring-blue-300
    focus:shadow-lg
    hover:shadow-md
    disabled:opacity-60
    disabled:cursor-not-allowed
    outline-none
  `}
/>


        <Button type="submit" disabled={loading || credits <= 0} className="px-8 h-12 rounded-2xl">
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {credits <= 0 && <p className="text-yellow-600 text-sm">You have no credits left. Contact support to upgrade.</p>}
    </form>
  )
}
