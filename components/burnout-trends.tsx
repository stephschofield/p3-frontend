"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"

interface BurnoutTrendData {
  week: string
  totalRisk: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  trend: "up" | "down" | "stable"
}

export function BurnoutTrends() {
  const trendData: BurnoutTrendData[] = [
    { week: "Aug 5-9", totalRisk: 32, highRiskCount: 1, mediumRiskCount: 3, lowRiskCount: 2, trend: "down" },
    { week: "Aug 12-16", totalRisk: 28, highRiskCount: 1, mediumRiskCount: 2, lowRiskCount: 3, trend: "down" },
    { week: "Aug 19-23", totalRisk: 35, highRiskCount: 2, mediumRiskCount: 2, lowRiskCount: 2, trend: "up" },
    { week: "Aug 26-30", totalRisk: 31, highRiskCount: 1, mediumRiskCount: 3, lowRiskCount: 1, trend: "down" },
  ]

  const currentWeek = trendData[trendData.length - 1]
  const previousWeek = trendData[trendData.length - 2]
  const weeklyChange = currentWeek.totalRisk - previousWeek.totalRisk

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-destructive" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-primary" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRiskBarWidth = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Burnout Risk Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">4-week trend analysis of team burnout risk levels</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Week Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Current Week Summary</h3>
              <div className="flex items-center gap-2">
                {getTrendIcon(currentWeek.trend)}
                <span
                  className={`text-sm font-medium ${
                    weeklyChange > 0 ? "text-destructive" : weeklyChange < 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {weeklyChange > 0 ? "+" : ""}
                  {weeklyChange} from last week
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">High Risk:</span>
                <div className="font-medium text-destructive">{currentWeek.highRiskCount} members</div>
              </div>
              <div>
                <span className="text-muted-foreground">Medium Risk:</span>
                <div className="font-medium text-chart-4">{currentWeek.mediumRiskCount} members</div>
              </div>
              <div>
                <span className="text-muted-foreground">Low Risk:</span>
                <div className="font-medium text-primary">{currentWeek.lowRiskCount} members</div>
              </div>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Weekly Risk Distribution</h3>
            {trendData.map((week, index) => {
              const totalMembers = week.highRiskCount + week.mediumRiskCount + week.lowRiskCount
              return (
                <div key={week.week} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{week.week}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Total Risk: {week.totalRisk}%</span>
                      {getTrendIcon(week.trend)}
                    </div>
                  </div>

                  <div className="flex h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="bg-destructive"
                      style={{ width: `${getRiskBarWidth(week.highRiskCount, totalMembers)}%` }}
                    />
                    <div
                      className="bg-chart-4"
                      style={{ width: `${getRiskBarWidth(week.mediumRiskCount, totalMembers)}%` }}
                    />
                    <div
                      className="bg-primary"
                      style={{ width: `${getRiskBarWidth(week.lowRiskCount, totalMembers)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>High: {week.highRiskCount}</span>
                    <span>Medium: {week.mediumRiskCount}</span>
                    <span>Low: {week.lowRiskCount}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Risk Factors Analysis */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Top Risk Factors This Month</h3>
            <div className="space-y-3">
              {[
                { factor: "Increased workload", percentage: 68, trend: "up" },
                { factor: "Negative sentiment patterns", percentage: 45, trend: "stable" },
                { factor: "Reduced team interaction", percentage: 32, trend: "down" },
                { factor: "Off-hours messaging", percentage: 28, trend: "up" },
              ].map((item) => (
                <div key={item.factor} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">{item.factor}</span>
                    {getTrendIcon(item.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div className="h-2 bg-chart-4 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-10">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Trend-Based Recommendations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Monitor workload distribution more closely - primary risk factor increasing</li>
              <li>• Consider team building activities to improve interaction levels</li>
              <li>• Implement "no after-hours messaging" policy to reduce stress</li>
              <li>• Schedule regular check-ins with team members showing risk indicators</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
