import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, FileText, Users, Settings, Download } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      icon: Calendar,
      title: "Schedule 1:1s",
      description: "Book individual check-ins",
      color: "bg-primary text-primary-foreground",
    },
    {
      icon: MessageSquare,
      title: "Send Pulse Survey",
      description: "Quick team mood check",
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: FileText,
      title: "Generate Report",
      description: "Weekly summary PDF",
      color: "bg-chart-4 text-white",
    },
    {
      icon: Users,
      title: "Team Meeting",
      description: "Schedule group discussion",
      color: "bg-chart-1 text-white",
    },
    {
      icon: Settings,
      title: "Configure Alerts",
      description: "Adjust notification settings",
      color: "bg-muted text-muted-foreground",
    },
    {
      icon: Download,
      title: "Export Data",
      description: "Download analytics CSV",
      color: "bg-chart-5 text-white",
    },
  ]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-xl">Quick Actions</CardTitle>
        <CardDescription>Common tasks and resources for team management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Button key={index} variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-card">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
