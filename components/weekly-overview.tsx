import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, AlertTriangle } from "lucide-react"

export function WeeklyOverview() {
  const metrics = [
    {
      title: "Overall Team Sentiment",
      value: "7.2",
      change: "+0.3",
      trend: "up",
      description: "out of 10",
      icon: Users,
    },
    {
      title: "Messages Analyzed",
      value: "2,847",
      change: "+12%",
      trend: "up",
      description: "this week",
      icon: MessageSquare,
    },
    {
      title: "Burnout Risk Level",
      value: "Low",
      change: "Stable",
      trend: "stable",
      description: "2 team members flagged",
      icon: AlertTriangle,
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-primary" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-primary"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                  <span>{metric.change}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
