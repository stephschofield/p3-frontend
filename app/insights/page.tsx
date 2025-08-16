import { InsightsDashboard } from "@/components/insights-dashboard"
import { ActionableRecommendations } from "@/components/actionable-recommendations"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain } from "lucide-react"
import Link from "next/link"

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Brain className="h-8 w-8" />
                Insights & Recommendations Center
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered insights and actionable recommendations for team engagement
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <InsightsDashboard />
        <ActionableRecommendations />
      </main>
    </div>
  )
}
