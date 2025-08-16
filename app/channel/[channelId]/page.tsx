"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MessageSquare, TrendingUp, Users, Hash } from "lucide-react"

interface ChannelMessage {
  id: string
  text: string
  user: string
  timestamp: string
  sentiment: number
  sentimentLabel: string
}

interface ChannelDetail {
  channelId: string
  channelName: string
  messageCount: number
  averageSentiment: number
  sentimentTrend: number[]
  topKeywords: string[]
  participationRate: number
  messages: ChannelMessage[]
  weeklyStats: {
    totalMessages: number
    activeUsers: number
    avgMessagesPerDay: number
  }
}

export default function ChannelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [channelData, setChannelData] = useState<ChannelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const channelId = params.channelId as string

  useEffect(() => {
    fetchChannelDetail()
  }, [channelId])

  const fetchChannelDetail = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching channel detail for:", channelId)

      const response = await fetch(`/api/channel/${channelId}/detail`)
      if (!response.ok) {
        throw new Error(`Failed to fetch channel detail: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Channel detail response:", data)
      setChannelData(data)
    } catch (err) {
      console.error("[v0] Error fetching channel detail:", err)
      setError(err instanceof Error ? err.message : "Failed to load channel data")
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return "text-green-600"
    if (sentiment >= 0.4) return "text-yellow-600"
    return "text-red-600"
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.7) return "Positive"
    if (sentiment >= 0.4) return "Neutral"
    return "Negative"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !channelData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error: {error || "Channel not found"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Hash className="h-6 w-6" />
            {channelData.channelName}
          </h1>
          <p className="text-gray-600">Channel Analysis Details</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{channelData.messageCount}</div>
            <p className="text-xs text-gray-600">this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(channelData.averageSentiment)}`}>
              {channelData.averageSentiment.toFixed(3)}
            </div>
            <p className="text-xs text-gray-600">out of 1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(channelData.participationRate * 100)}%</div>
            <p className="text-xs text-gray-600">engagement rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {channelData.topKeywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sentiment Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Sentiment Trend</CardTitle>
          <CardDescription>Sentiment scores throughout the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day, index) => {
              const sentiment = channelData.sentimentTrend[index] || 0
              const hasData = sentiment > 0

              return (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{day}</div>
                  <div className="flex-1">
                    <Progress value={hasData ? sentiment * 100 : 0} className="h-2" />
                  </div>
                  <div className="w-16 text-right">
                    {hasData ? (
                      <span className={`text-sm font-medium ${getSentimentColor(sentiment)}`}>
                        {sentiment.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No data</span>
                    )}
                  </div>
                  <div className="w-16">
                    {hasData && (
                      <Badge variant="outline" className="text-xs">
                        {getSentimentLabel(sentiment)}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Individual message sentiment analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelData.messages.length > 0 ? (
              channelData.messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.sentimentLabel}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getSentimentColor(message.sentiment)}`}>
                        {message.sentiment.toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{message.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages available for detailed analysis</p>
                <p className="text-sm">Message details may be limited due to privacy settings</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
