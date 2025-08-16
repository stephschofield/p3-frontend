"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, X, UserCheck } from "lucide-react"
import { useState } from "react"

export function TeamConfiguration() {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Engineering Team",
      manager: "Sarah Johnson",
      channels: ["engineering", "general"],
      members: 12,
    },
    {
      id: 2,
      name: "Marketing Team",
      manager: "Mike Chen",
      channels: ["marketing", "general"],
      members: 8,
    },
  ])

  const [newTeamName, setNewTeamName] = useState("")

  const addTeam = () => {
    if (newTeamName.trim()) {
      setTeams([
        ...teams,
        {
          id: Date.now(),
          name: newTeamName,
          manager: "",
          channels: [],
          members: 0,
        },
      ])
      setNewTeamName("")
    }
  }

  const removeTeam = (teamId: number) => {
    setTeams(teams.filter((team) => team.id !== teamId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Configuration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Organize channels into teams and assign managers for targeted insights
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.members} members</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTeam(team.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Team Manager</label>
                    <Select defaultValue={team.manager}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                        <SelectItem value="Alex Rodriguez">Alex Rodriguez</SelectItem>
                        <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Monitored Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {team.channels.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          #{channel}
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    <span>Manager: {team.manager || "Not assigned"}</span>
                  </div>
                  <span>•</span>
                  <span>Channels: {team.channels.length}</span>
                  <span>•</span>
                  <span>Weekly reports enabled</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Input
              placeholder="New team name..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addTeam} disabled={!newTeamName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Team Configuration Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Assign managers who will receive weekly sentiment reports</li>
              <li>• Group channels by functional teams for more relevant insights</li>
              <li>• Each team should have at least 2-3 active channels for meaningful analysis</li>
              <li>• Managers will get alerts for burnout risks within their teams</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
