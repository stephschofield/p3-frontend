"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Settings } from "lucide-react"

interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  is_member: boolean
}

export function SlackIntegrationStatus() {
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configurationRequired, setConfigurationRequired] = useState(false)

  const fetchChannels = async () => {
    try {
      setLoading(true)
      setError(null)
      setConfigurationRequired(false)

      console.log("[v0] Fetching Slack channels from API")

      const response = await fetch("/api/slack/channels")
      const data = await response.json()

      if (data.success) {
        setChannels(data.channels)
        console.log("[v0] Channels loaded successfully:", data.channels.length)
      } else {
        setError(data.error || "Failed to fetch channels")
        if (data.configurationRequired) {
          setConfigurationRequired(true)
        }
      }
    } catch (err) {
      console.error("[v0] Error fetching channels:", err)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-serif">Slack Integration</CardTitle>
          <CardDescription>Monitor channels for sentiment analysis</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchChannels} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
            {configurationRequired && (
              <Button variant="outline" size="sm" asChild>
                <a href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configure Slack API
                </a>
              </Button>
            )}
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading channels...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Connected to {channels.length} channels</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Monitored Channels:</h4>
              <div className="flex flex-wrap gap-2">
                {channels.slice(0, 6).map((channel) => (
                  <Badge key={channel.id} variant="secondary" className="text-xs">
                    #{channel.name}
                    {channel.is_private && " 🔒"}
                  </Badge>
                ))}
                {channels.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{channels.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
