"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slack, CheckCircle, AlertCircle, Settings } from "lucide-react"
import { useState } from "react"

export function SlackConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
    }, 2000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Slack className="h-5 w-5" />
          Slack Workspace Connection
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your Slack workspace to enable sentiment analysis of team communications
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Slack className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  {isConnected ? "Acme Corp Workspace" : "Slack Workspace"}
                </h3>
                <p className="text-sm text-muted-foreground">{isConnected ? "acme-corp.slack.com" : "Not connected"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <Badge className="bg-primary text-primary-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleDisconnect}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-muted-foreground">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                  <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center gap-2">
                    <Slack className="h-4 w-4" />
                    {isConnecting ? "Connecting..." : "Connect to Slack"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {isConnected && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Connection Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Workspace:</span>
                  <div className="font-medium text-foreground">Acme Corp</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Connected as:</span>
                  <div className="font-medium text-foreground">@manager.bot</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Permissions:</span>
                  <div className="font-medium text-foreground">Read channels, Read messages</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last sync:</span>
                  <div className="font-medium text-foreground">2 minutes ago</div>
                </div>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Required Permissions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Read public channel names and basic information</li>
                <li>• Read messages from selected channels only</li>
                <li>• Read emoji reactions and thread replies</li>
                <li>• No access to private channels or direct messages</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
