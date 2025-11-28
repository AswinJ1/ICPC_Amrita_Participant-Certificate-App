"use client"

import { useEffect, useRef } from "react"
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"

// Apply theme
am4core.useTheme(am4themes_animated)

type Stats = {
  verifiedParticipants: number
  unverifiedParticipants: number
}

export default function PieChartStats({ stats }: { stats: Stats | null }) {
  const chartRef = useRef<am4charts.PieChart3D | null>(null)
  const divRef = useRef<HTMLDivElement | null>(null)

  // Create chart once
  useEffect(() => {
    if (!divRef.current) return

    const chart = am4core.create(divRef.current, am4charts.PieChart3D)
    chart.hiddenState.properties.opacity = 0

    // Legend
    chart.legend = new am4charts.Legend()
    chart.legend.position = "bottom"

    // Series
    const series = chart.series.push(new am4charts.PieSeries3D())
    series.dataFields.value = "value"
    series.dataFields.category = "category"

    // 3D depth
    chart.depth = 20
    series.depth = 20

    // Colors
    series.colors.list = [
      am4core.color("#10b981"), // Verified
      am4core.color("#ef4444")  // Not verified
    ]

    // Slices
    series.slices.template.stroke = am4core.color("#ffffffff")
    series.slices.template.strokeWidth = 2
    series.slices.template.strokeOpacity = 1
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer

    const hoverState = series.slices.template.states.getKey("hover")
    if (hoverState) {
      hoverState.properties.scale = 1.05
      hoverState.properties.shiftRadius = 0.1
    }

    // Labels
    series.labels.template.text = "{category}: {value.percent.formatNumber('#.##')}%"
    series.labels.template.radius = am4core.percent(-40)
    series.labels.template.fill = am4core.color("#000000ff")
    series.labels.template.fontSize = 12
    series.labels.template.fontWeight = "bold"

    // Ticks
    series.ticks.template.disabled = false
    series.ticks.template.stroke = am4core.color("#000000ff")

    // Tooltips
    series.slices.template.tooltipText =
      "{category}: {value} participants ({value.percent.formatNumber('#.##')}%)"

    // Legend labels
    chart.legend.valueLabels.template.text =
      "{value} ({value.percent.formatNumber('#.##')}%)"
    chart.legend.labels.template.maxWidth = 170
    chart.legend.labels.template.truncate = true

    chart.appear()

    chartRef.current = chart

    return () => {
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  // Update data when stats change
  useEffect(() => {
    if (!chartRef.current || !stats) return

    const verified = stats.verifiedParticipants ?? 0
    const unverified = stats.unverifiedParticipants ?? 0
    const total = verified + unverified

    if (total === 0) {
      chartRef.current.data = []
      return
    }

    chartRef.current.data = [
      {
        category: "Verified",
        value: verified
      },
      {
        category: "Not Verified",
        value: unverified
      }
    ]
  }, [stats])

  // Calculate display values
  const verified = stats?.verifiedParticipants ?? 0
  const unverified = stats?.unverifiedParticipants ?? 0
  const total = verified + unverified
  const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg border">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Verification Status
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 p-1">
          Verification Status
        </h2>
      </div>

      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-600 mb-4 p-2 bg-white/50 rounded">
        Overview : Verified: {verified} | Not Verified: {unverified} | Total: {total} 
      </div>

      {total > 0 ? (
        <div ref={divRef} className="w-full h-96" />
      ) : (
        <div className="flex items-center justify-center h-96 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="font-semibold">No data available</div>
            <div className="text-sm mt-1">
              Data will appear when participants verify
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
