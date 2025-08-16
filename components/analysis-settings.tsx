"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Settings, Clock, AlertTriangle, BarChart3 } from "lucide-react"
import { useState } from "react"

export function AnalysisSettings() {
  const [burnoutThreshold, setBurnoutThreshold] = useState([75])
  const [enableAlerts, setEnableAlerts] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [includeReactions, setIncludeReactions] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Analysis Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure how sentiment analysis is performed and when alerts are triggered
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Report Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="report-day">Weekly Report Day</Label>
                <Select defaultValue="monday">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-time">Report Time</Label>
                <Select defaultValue="09:00">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alert Configuration
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enable-alerts">Enable Burnout Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send immediate notifications when burnout risk is detected
                  </p>
                </div>
                <Switch id="enable-alerts" checked={enableAlerts} onCheckedChange={setEnableAlerts} />
              </div>

              <div className="space-y-3">
                <Label>Burnout Risk Threshold</Label>
                <div className="px-3">
                  <Slider
                    value={burnoutThreshold}
                    onValueChange={setBurnoutThreshold}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Low Risk (50)</span>
                    <span className="font-medium text-foreground">{burnoutThreshold[0]}</span>
                    <span>High Risk (100)</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alert when individual burnout risk score exceeds {burnoutThreshold[0]}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis Options
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="include-emojis">Include Emoji Analysis</Label>
                  <p className="text-sm text-muted-foreground">Analyze emoji usage patterns for sentiment insights</p>
                </div>
                <Switch id="include-emojis" checked={includeEmojis} onCheckedChange={setIncludeEmojis} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="include-reactions">Include Message Reactions</Label>
                  <p className="text-sm text-muted-foreground">Consider emoji reactions when calculating sentiment</p>
                </div>
                <Switch id="include-reactions" checked={includeReactions} onCheckedChange={setIncludeReactions} />
              </div>

              <div className="space-y-2">
                <Label>Minimum Messages per Week</Label>
                <Select defaultValue="50">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 messages</SelectItem>
                    <SelectItem value="50">50 messages</SelectItem>
                    <SelectItem value="100">100 messages</SelectItem>
                    <SelectItem value="200">200 messages</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Minimum message volume required for reliable sentiment analysis
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Privacy & Compliance</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All message content is processed anonymously</li>
              <li>• Individual messages are not stored or displayed</li>
              <li>• Only aggregated sentiment scores are retained</li>
              <li>• Data is automatically deleted after 90 days</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
