import { SlackConnection } from "@/components/slack-connection"
import { ChannelSelector } from "@/components/channel-selector"
import { TeamConfiguration } from "@/components/team-configuration"
import { AnalysisSettings } from "@/components/analysis-settings"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function ConfigurePage() {
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
              <h1 className="text-3xl font-bold text-foreground">Configuration</h1>
              <p className="text-muted-foreground mt-1">Set up your Slack integration and analysis preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <SlackConnection />
        <ChannelSelector />
        <TeamConfiguration />
        <AnalysisSettings />

        <div className="flex justify-end pt-6 border-t">
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </main>
    </div>
  )
}
