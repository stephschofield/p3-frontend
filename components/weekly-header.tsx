import { Button } from "@/components/ui/button"
import { Calendar, Settings, Download } from "lucide-react"
import Link from "next/link"

export function WeeklyHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Engagement Pulse</h1>
            <p className="text-muted-foreground mt-1">Weekly Team Sentiment Report</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Week of Aug 12-16, 2025</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Link href="/configure">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
