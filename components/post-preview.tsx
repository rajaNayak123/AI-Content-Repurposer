"use client"

import { MessageCircle, Repeat, Heart, Share, ThumbsUp, MessageSquare, Send } from "lucide-react"

interface PostPreviewProps {
  content: string
  platform: "twitter" | "linkedin"
  authorName: string
  authorHandle?: string
  authorImage?: string
}

export default function PostPreview({
  content,
  platform,
  authorName,
  authorHandle,
  authorImage,
}: PostPreviewProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (platform === "twitter") {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {getInitials(authorName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                {authorName}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                @{authorHandle || authorName.toLowerCase().replace(/\s+/g, "")}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">· 2h</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mb-3">
          <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <button className="flex items-center gap-2 text-gray-500 hover:text-sky-500 transition-colors group">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">Reply</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors group">
            <Repeat className="h-4 w-4" />
            <span className="text-xs">Repost</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-rose-500 transition-colors group">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Like</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-sky-500 transition-colors group">
            <Share className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>
    )
  }

  if (platform === "linkedin") {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
              {getInitials(authorName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {authorName}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Content Creator • 2h • 🌐
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mb-4">
          <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs font-medium">Like</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">Comment</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Repeat className="h-4 w-4" />
            <span className="text-xs font-medium">Repost</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Send className="h-4 w-4" />
            <span className="text-xs font-medium">Send</span>
          </button>
        </div>
      </div>
    )
  }

  return null
}