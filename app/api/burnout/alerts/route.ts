import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock burnout alerts data - in real app, this would come from database
    const alerts = [
      {
        id: "1",
        userId: "U123456",
        userName: "Alex Chen",
        riskScore: 78,
        riskLevel: "high",
        indicators: [
          "Increased negative sentiment over 2 weeks",
          "Reduced participation in team discussions",
          "Messages sent outside normal hours",
        ],
        recommendations: [
          "Schedule immediate 1:1 check-in",
          "Review current project workload",
          "Consider temporary workload reduction",
        ],
        lastUpdated: new Date().toISOString(),
        acknowledged: false,
      },
      {
        id: "2",
        userId: "U789012",
        userName: "Sarah Kim",
        riskScore: 65,
        riskLevel: "medium",
        indicators: ["Exhaustion-related keywords detected", "Declining engagement in team channels"],
        recommendations: [
          "Check in during next team meeting",
          "Offer flexible work arrangements",
          "Encourage time off if needed",
        ],
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
    ]

    console.log("[v0] Retrieved", alerts.length, "burnout alerts")

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("[v0] Error fetching burnout alerts:", error)
    return NextResponse.json({ error: "Failed to fetch burnout alerts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { alertId, action } = body

    if (action === "acknowledge") {
      console.log("[v0] Acknowledging burnout alert:", alertId)
      // In real app, update database to mark alert as acknowledged
      return NextResponse.json({ success: true, message: "Alert acknowledged" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error updating burnout alert:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}
