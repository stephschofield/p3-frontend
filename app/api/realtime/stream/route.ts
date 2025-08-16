import type { NextRequest } from "next/server"
import { realtimePipeline } from "@/lib/real-time-pipeline"

export async function GET(request: NextRequest) {
  console.log("[v0] Setting up real-time stream connection")

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const safeEncode = (data: any) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
          return true
        } catch (error) {
          console.error("[v0] Error encoding stream data:", error)
          return false
        }
      }

      // Send initial connection message
      safeEncode({ type: "connected", message: "Real-time stream connected" })

      let unsubscribe: (() => void) | null = null
      try {
        unsubscribe = realtimePipeline.subscribe((data) => {
          safeEncode(data)
          console.log("[v0] Sent real-time update:", data.type)
        })
      } catch (error) {
        console.error("[v0] Error subscribing to pipeline:", error)
        safeEncode({
          type: "error",
          message: "Pipeline subscription failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      const statsInterval = setInterval(() => {
        try {
          const stats = realtimePipeline.getStats()
          const summary = realtimePipeline.generateRealtimeSummary()
          safeEncode({
            type: "periodic_update",
            stats,
            summary,
          })
        } catch (error) {
          console.error("[v0] Error sending periodic update:", error)
          safeEncode({
            type: "periodic_update",
            stats: {
              messagesProcessed: 0,
              averageProcessingTime: 0,
              lastProcessedAt: new Date().toISOString(),
              queueSize: 0,
              errors: 0,
            },
            summary: {
              totalMessages: 0,
              averageSentiment: 0,
              sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
              topChannels: [],
              alerts: [],
            },
          })
        }
      }, 30000) // Every 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        console.log("[v0] Real-time stream connection closed")
        if (unsubscribe) {
          try {
            unsubscribe()
          } catch (error) {
            console.error("[v0] Error during unsubscribe:", error)
          }
        }
        clearInterval(statsInterval)
        try {
          controller.close()
        } catch (error) {
          console.error("[v0] Error closing controller:", error)
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
