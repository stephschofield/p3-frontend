import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock burnout trend data - in real app, this would come from database
    const trendData = {
      currentWeek: {
        totalRisk: 31,
        highRiskCount: 1,
        mediumRiskCount: 3,
        lowRiskCount: 1,
        trend: "down" as const,
      },
      weeklyTrends: [
        {
          week: "Aug 5-9",
          totalRisk: 32,
          highRiskCount: 1,
          mediumRiskCount: 3,
          lowRiskCount: 2,
          trend: "down" as const,
        },
        {
          week: "Aug 12-16",
          totalRisk: 28,
          highRiskCount: 1,
          mediumRiskCount: 2,
          lowRiskCount: 3,
          trend: "down" as const,
        },
        {
          week: "Aug 19-23",
          totalRisk: 35,
          highRiskCount: 2,
          mediumRiskCount: 2,
          lowRiskCount: 2,
          trend: "up" as const,
        },
        {
          week: "Aug 26-30",
          totalRisk: 31,
          highRiskCount: 1,
          mediumRiskCount: 3,
          lowRiskCount: 1,
          trend: "down" as const,
        },
      ],
      riskFactors: [
        { factor: "Increased workload", percentage: 68, trend: "up" as const },
        { factor: "Negative sentiment patterns", percentage: 45, trend: "stable" as const },
        { factor: "Reduced team interaction", percentage: 32, trend: "down" as const },
        { factor: "Off-hours messaging", percentage: 28, trend: "up" as const },
      ],
      recommendations: [
        "Monitor workload distribution more closely - primary risk factor increasing",
        "Consider team building activities to improve interaction levels",
        "Implement 'no after-hours messaging' policy to reduce stress",
        "Schedule regular check-ins with team members showing risk indicators",
      ],
    }

    console.log("[v0] Retrieved burnout trend data")

    return NextResponse.json(trendData)
  } catch (error) {
    console.error("[v0] Error fetching burnout trends:", error)
    return NextResponse.json({ error: "Failed to fetch burnout trends" }, { status: 500 })
  }
}
