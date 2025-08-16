"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Hash, Users, Search, Plus } from "lucide-react"
import { useState } from "react"

export function ChannelSelector() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["general", "engineering"])

  const channels = [
    { id: "general", name: "general", members: 45, description: "Company-wide announcements and general discussion" },
    { id: "engineering", name: "engineering", members: 12, description: "Engineering team discussions and updates" },
    { id: "marketing", name: "marketing", members: 8, description: "Marketing team coordination and campaigns" },
    { id: "product", name: "product", members: 15, description: "Product development and roadmap discussions" },
    { id: "random", name: "random", members: 32, description: "Casual conversations and team bonding" },
    { id: "support", name: "support", members: 6, description: "Customer support team coordination" },
  ]

  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Channel Selection
        </CardTitle>
        <p className="text-sm text-muted-foreground">Choose which channels to monitor for weekly sentiment analysis</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              {selectedChannels.length} selected
            </Badge>
          </div>

          <div className="space-y-3">
            {filteredChannels.map((channel) => (
              <div key={channel.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={channel.id}
                  checked={selectedChannels.includes(channel.id)}
                  onCheckedChange={() => handleChannelToggle(channel.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{channel.name}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{channel.members}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-7">{channel.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Selection Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Select channels with regular team communication (minimum 50 messages/week)</li>
              <li>• Include both work-focused and casual channels for balanced insights</li>
              <li>• Avoid channels with sensitive information or HR discussions</li>
              <li>• Consider channels where team members express opinions and emotions</li>
            </ul>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Selected channels will be analyzed weekly for sentiment trends
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Channel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
