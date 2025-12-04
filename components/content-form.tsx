"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Twitter, Linkedin, Instagram, Facebook, Mail } from "lucide-react"

interface ContentFormProps {
  onSubmit: (url: string, tone: string, platforms: string[]) => Promise<void>
  loading: boolean
  credits: number
  onBuyCredits: () => void
}

export default function ContentForm({ onSubmit, loading, credits, onBuyCredits }: ContentFormProps) {
  const [url, setUrl] = useState("")
  const [tone, setTone] = useState("professional")
  const [error, setError] = useState("")
  const [platforms, setPlatforms] = useState({
    twitter: false,
    linkedin: false,
    instagram: false,
    facebook: false,
    email: false,
  })

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

  const handlePlatformToggle = (platform: keyof typeof platforms) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  const getSelectedPlatforms = (): string[] => {
    return Object.entries(platforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (credits <= 0) {
      onBuyCredits()
      return
    }

    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid YouTube or blog URL")
      return
    }

    const selectedPlatforms = getSelectedPlatforms()
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform")
      return
    }

    await onSubmit(url, tone, selectedPlatforms)
    setUrl("")
  }

  const platformOptions = [
    { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-sky-500' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { id: 'email', label: 'Email', icon: Mail, color: 'text-purple-600' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste YouTube link or blog URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className={`
            h-13
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

        <Select value={tone} onValueChange={(value) => setTone(value)} disabled={loading}>
          <SelectTrigger className="p-6 rounded-2xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-300 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="funny">Funny</SelectItem>
            <SelectItem value="controversial">Controversial</SelectItem>
            <SelectItem value="inspirational">Inspirational</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={loading} className="px-8 h-13 rounded-2xl cursor-pointer">
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Platforms to Generate:
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {platformOptions.map(({ id, label, icon: Icon, color }) => (
            <div
              key={id}
              className={`
                flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                ${platforms[id as keyof typeof platforms] 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Checkbox
                id={id}
                checked={platforms[id as keyof typeof platforms]}
                onCheckedChange={() => handlePlatformToggle(id as keyof typeof platforms)}
                disabled={loading}
              />
              <Label
                htmlFor={id}
                className="flex items-center gap-2 cursor-pointer flex-1 text-sm font-medium"
              >
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  )
}
