import { BurnoutAlerts } from "@/components/burnout-alerts"
import { BurnoutTrends } from "@/components/burnout-trends"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function BurnoutPage() {
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
                <AlertTriangle className="h-8 w-8" />
                Burnout Detection Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage team burnout risks with AI-powered insights
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <BurnoutAlerts />
          <BurnoutTrends />
        </div>
      </main>
    </div>
  )
}
