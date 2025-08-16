import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertTriangle } from "lucide-react"

export function SlackPermissionsGuide() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900">Slack Bot Permissions Required</CardTitle>
        </div>
        <CardDescription className="text-amber-700">
          Your Slack bot needs additional permissions to access channel data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Missing Scopes:</strong> channels:read, groups:read, chat:history
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium text-amber-900">To fix this:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
            <li>
              Go to your Slack app settings at <strong>api.slack.com/apps</strong>
            </li>
            <li>
              Select your app and navigate to <strong>"OAuth & Permissions"</strong>
            </li>
            <li>
              Add these Bot Token Scopes:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>
                  <code className="bg-amber-100 px-1 rounded">channels:read</code> - View basic information about public
                  channels
                </li>
                <li>
                  <code className="bg-amber-100 px-1 rounded">groups:read</code> - View basic information about private
                  channels
                </li>
                <li>
                  <code className="bg-amber-100 px-1 rounded">channels:history</code> - View messages in public channels
                </li>
                <li>
                  <code className="bg-amber-100 px-1 rounded">groups:history</code> - View messages in private channels
                </li>
              </ul>
            </li>
            <li>
              Click <strong>"Reinstall to Workspace"</strong>
            </li>
            <li>Add the bot to channels you want to monitor</li>
          </ol>
        </div>

        <Button asChild className="w-full">
          <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer">
            Open Slack App Settings <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
