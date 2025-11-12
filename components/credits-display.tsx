"use client"

import { Card } from "@/components/ui/card"

interface CreditsDisplayProps {
  credits: number
}

export default function CreditsDisplay({ credits }: CreditsDisplayProps) {
  return (
    <Card className="bg-primary text-primary-foreground px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm opacity-90">Available Credits</p>
          <p className="text-3xl font-bold">{credits}</p>
        </div>
      </div>
    </Card>
  )
}
