"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Save, TestTube, CheckCircle, XCircle, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiConfig {
  slackClientId: string
  slackClientSecret: string
  slackSigningSecret: string
  slackBotToken: string
  azureOpenaiEndpoint: string
  azureOpenaiApiKey: string
  azureOpenaiDeploymentName: string
  azureOpenaiApiVersion: string
}

interface ConnectionStatus {
  slack: "connected" | "disconnected" | "testing"
  azureOpenai: "connected" | "disconnected" | "testing"
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [config, setConfig] = useState<ApiConfig>({
    slackClientId: "",
    slackClientSecret: "",
    slackSigningSecret: "",
    slackBotToken: "",
    azureOpenaiEndpoint: "",
    azureOpenaiApiKey: "",
    azureOpenaiDeploymentName: "gpt-4",
    azureOpenaiApiVersion: "2024-02-15-preview",
  })

  const [showSecrets, setShowSecrets] = useState({
    slackClientSecret: false,
    slackSigningSecret: false,
    slackBotToken: false,
    azureOpenaiApiKey: false,
  })

  const [status, setStatus] = useState<ConnectionStatus>({
    slack: "disconnected",
    azureOpenai: "disconnected",
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/settings/config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        // Test connections after loading
        testConnections()
      }
    } catch (error) {
      console.error("Failed to load config:", error)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "API configuration has been updated successfully.",
        })
        testConnections()
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testConnections = async () => {
    // Test Slack connection
    setStatus((prev) => ({ ...prev, slack: "testing" }))
    try {
      const slackResponse = await fetch("/api/slack/test")
      setStatus((prev) => ({
        ...prev,
        slack: slackResponse.ok ? "connected" : "disconnected",
      }))
    } catch {
      setStatus((prev) => ({ ...prev, slack: "disconnected" }))
    }

    // Test Azure OpenAI connection
    setStatus((prev) => ({ ...prev, azureOpenai: "testing" }))
    try {
      const azureResponse = await fetch("/api/azure-openai/test")
      setStatus((prev) => ({
        ...prev,
        azureOpenai: azureResponse.ok ? "connected" : "disconnected",
      }))
    } catch {
      setStatus((prev) => ({ ...prev, azureOpenai: "disconnected" }))
    }
  }

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const getStatusBadge = (connectionStatus: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )
      case "testing":
        return (
          <Badge variant="secondary">
            <TestTube className="w-3 h-3 mr-1" />
            Testing...
          </Badge>
        )
      case "disconnected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Configure your API integrations and system preferences</p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrations">API Integrations</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Slack Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Slack Integration
                    {getStatusBadge(status.slack)}
                  </CardTitle>
                  <CardDescription>Configure your Slack app credentials to monitor team communications</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnections()}
                  disabled={status.slack === "testing"}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slackClientId">Client ID</Label>
                  <Input
                    id="slackClientId"
                    value={config.slackClientId}
                    onChange={(e) => setConfig((prev) => ({ ...prev, slackClientId: e.target.value }))}
                    placeholder="Enter Slack Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slackClientSecret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="slackClientSecret"
                      type={showSecrets.slackClientSecret ? "text" : "password"}
                      value={config.slackClientSecret}
                      onChange={(e) => setConfig((prev) => ({ ...prev, slackClientSecret: e.target.value }))}
                      placeholder="Enter Slack Client Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility("slackClientSecret")}
                    >
                      {showSecrets.slackClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slackSigningSecret">Signing Secret</Label>
                  <div className="relative">
                    <Input
                      id="slackSigningSecret"
                      type={showSecrets.slackSigningSecret ? "text" : "password"}
                      value={config.slackSigningSecret}
                      onChange={(e) => setConfig((prev) => ({ ...prev, slackSigningSecret: e.target.value }))}
                      placeholder="Enter Slack Signing Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility("slackSigningSecret")}
                    >
                      {showSecrets.slackSigningSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slackBotToken">Bot Token</Label>
                  <div className="relative">
                    <Input
                      id="slackBotToken"
                      type={showSecrets.slackBotToken ? "text" : "password"}
                      value={config.slackBotToken}
                      onChange={(e) => setConfig((prev) => ({ ...prev, slackBotToken: e.target.value }))}
                      placeholder="xoxb-..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility("slackBotToken")}
                    >
                      {showSecrets.slackBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  To get these credentials, create a Slack app at{" "}
                  <a
                    href="https://api.slack.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    api.slack.com/apps
                  </a>{" "}
                  and configure the necessary OAuth scopes and event subscriptions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Azure OpenAI Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Azure OpenAI Integration
                    {getStatusBadge(status.azureOpenai)}
                  </CardTitle>
                  <CardDescription>
                    Configure your Azure OpenAI service for sentiment analysis and insights
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnections()}
                  disabled={status.azureOpenai === "testing"}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="azureOpenaiEndpoint">Endpoint URL</Label>
                  <Input
                    id="azureOpenaiEndpoint"
                    value={config.azureOpenaiEndpoint}
                    onChange={(e) => setConfig((prev) => ({ ...prev, azureOpenaiEndpoint: e.target.value }))}
                    placeholder="https://your-resource.openai.azure.com/"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azureOpenaiApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="azureOpenaiApiKey"
                      type={showSecrets.azureOpenaiApiKey ? "text" : "password"}
                      value={config.azureOpenaiApiKey}
                      onChange={(e) => setConfig((prev) => ({ ...prev, azureOpenaiApiKey: e.target.value }))}
                      placeholder="Enter Azure OpenAI API Key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility("azureOpenaiApiKey")}
                    >
                      {showSecrets.azureOpenaiApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azureOpenaiDeploymentName">Deployment Name</Label>
                  <Input
                    id="azureOpenaiDeploymentName"
                    value={config.azureOpenaiDeploymentName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, azureOpenaiDeploymentName: e.target.value }))}
                    placeholder="gpt-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azureOpenaiApiVersion">API Version</Label>
                  <Input
                    id="azureOpenaiApiVersion"
                    value={config.azureOpenaiApiVersion}
                    onChange={(e) => setConfig((prev) => ({ ...prev, azureOpenaiApiVersion: e.target.value }))}
                    placeholder="2024-02-15-preview"
                  />
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Create an Azure OpenAI resource in the Azure portal and deploy a GPT-4 model to get these credentials.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveConfig} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Additional preferences will be available in future updates.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
