import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp } from "lucide-react"

export function WeeklyInsights() {
  const sentimentData = [
    { day: "Mon", sentiment: 7.1, messages: 412 },
    { day: "Tue", sentiment: 6.8, messages: 389 },
    { day: "Wed", sentiment: 7.5, messages: 456 },
    { day: "Thu", sentiment: 7.3, messages: 423 },
    { day: "Fri", sentiment: 7.8, messages: 367 },
  ]

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 7.5) return "bg-primary"
    if (sentiment >= 6.5) return "bg-accent"
    return "bg-destructive"
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 7.5) return "Positive"
    if (sentiment >= 6.5) return "Neutral"
    return "Negative"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Sentiment Trends
          </CardTitle>
          <Badge variant="outline" className="text-primary border-primary">
            <TrendingUp className="h-3 w-3 mr-1" />
            Improving
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sentimentData.map((day) => (
            <div key={day.day} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-muted-foreground">{day.day}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getSentimentColor(day.sentiment)}`}
                      style={{ width: `${(day.sentiment / 10) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-foreground w-8">{day.sentiment}</div>
                  <Badge variant="secondary" className="text-xs">
                    {getSentimentLabel(day.sentiment)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{day.messages} messages analyzed</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Key Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sentiment peaked on Friday with positive project completion discussions</li>
            <li>• Tuesday showed lower engagement due to system maintenance issues</li>
            <li>• Overall weekly trend shows 4% improvement from last week</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
