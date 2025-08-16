import { DashboardHeader } from "@/components/dashboard-header"
import { SentimentOverview } from "@/components/sentiment-overview"
import { BurnoutAlerts } from "@/components/burnout-alerts"
import { TeamHeatmap } from "@/components/team-heatmap"
import { MoodTrends } from "@/components/mood-trends"
import { ActionableInsights } from "@/components/actionable-insights"
import { QuickActions } from "@/components/quick-actions"
import { SlackIntegrationStatus } from "@/components/slack-integration-status"
import { AzureOpenAIStatus } from "@/components/azure-openai-status"
import { SentimentProcessor } from "@/components/sentiment-processor"
import { RealtimeMonitor } from "@/components/realtime-monitor"
import ConfigurationBanner from "@/components/configuration-banner"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ConfigurationBanner />

        {/* Integration Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <SlackIntegrationStatus />
          <AzureOpenAIStatus />
          <SentimentProcessor />
          <RealtimeMonitor />
        </div>

        {/* Hero Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SentimentOverview />
          </div>
          <div>
            <BurnoutAlerts />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TeamHeatmap />
          <MoodTrends />
        </div>

        {/* Insights and Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ActionableInsights />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}
