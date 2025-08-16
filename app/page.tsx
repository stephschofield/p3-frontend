import { WeeklyOverview } from "@/components/weekly-overview"
import { WeeklyInsights } from "@/components/weekly-insights"
import { BurnoutAlerts } from "@/components/burnout-alerts"
import { ActionableRecommendations } from "@/components/actionable-recommendations"
import { WeeklyHeader } from "@/components/weekly-header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <WeeklyHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <WeeklyOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WeeklyInsights />
          <BurnoutAlerts />
        </div>
        <ActionableRecommendations />
      </main>
    </div>
  )
}
