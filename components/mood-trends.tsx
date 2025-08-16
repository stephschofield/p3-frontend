import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MoodTrends() {
  // Mock data for the past 7 days
  const trendData = [
    { day: "Mon", sentiment: 7.2, messages: 145 },
    { day: "Tue", sentiment: 6.8, messages: 132 },
    { day: "Wed", sentiment: 7.5, messages: 167 },
    { day: "Thu", sentiment: 7.1, messages: 154 },
    { day: "Fri", sentiment: 6.9, messages: 98 },
    { day: "Sat", sentiment: 8.2, messages: 23 },
    { day: "Sun", sentiment: 7.8, messages: 31 },
  ]

  const maxSentiment = Math.max(...trendData.map((d) => d.sentiment))
  const minSentiment = Math.min(...trendData.map((d) => d.sentiment))

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl">7-Day Mood Trends</CardTitle>
        <CardDescription>Daily sentiment scores and message volume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trend Chart */}
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-end justify-between space-x-2">
              {trendData.map((data, index) => {
                const height = ((data.sentiment - minSentiment) / (maxSentiment - minSentiment)) * 100
                return (
                  <div key={data.day} className="flex-1 flex flex-col items-center space-y-2">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary/80"
                        style={{ height: `${height}%` }}
                        title={`${data.day}: ${data.sentiment}/10`}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Day labels and values */}
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-2 text-center">
              {trendData.map((data) => (
                <div key={data.day} className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">{data.day}</div>
                  <div className="text-sm font-bold text-primary">{data.sentiment}</div>
                </div>
              ))}
            </div>

            {/* Message volume indicators */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {trendData.map((data) => (
                <div key={`${data.day}-messages`} className="text-xs text-muted-foreground">
                  {data.messages} msgs
                </div>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-primary font-serif">
                {(trendData.reduce((sum, d) => sum + d.sentiment, 0) / trendData.length).toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent font-serif">
                {Math.max(...trendData.map((d) => d.sentiment))}
              </div>
              <div className="text-xs text-muted-foreground">Peak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-chart-4 font-serif">
                {trendData.reduce((sum, d) => sum + d.messages, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Msgs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
