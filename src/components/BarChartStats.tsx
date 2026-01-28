"use client"

import { useEffect, useRef } from "react"
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"

am4core.useTheme(am4themes_animated)

export default function BarChartStats({ stats }: any) {
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!stats?.teamDownloads) return

    let chart = am4core.create("teamBarChartDiv", am4charts.XYChart)

    chart.padding(20, 20, 20, 20)

    chart.data = stats.teamDownloads.slice(0, 8).map((t: any) => ({
      teamName: t.teamName,
      downloads: t.downloads,
      members: t.members,
    }))

    // Create Category Axis (X-axis)
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    categoryAxis.dataFields.category = "teamName"
    categoryAxis.renderer.grid.template.location = 0
    categoryAxis.renderer.minGridDistance = 20
    categoryAxis.renderer.labels.template.rotation = 300
    categoryAxis.renderer.labels.template.fontSize = 12

    // Create Value Axis (Y-axis)
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
    valueAxis.min = 0

    // --- Downloads Series ---
    let series1 = chart.series.push(new am4charts.ColumnSeries())
    series1.name = "Downloads"
    series1.dataFields.valueY = "downloads"
    series1.dataFields.categoryX = "teamName"
    series1.columns.template.tooltipText = "{categoryX}\nDownloads: {valueY}"
    series1.columns.template.fill = am4core.color("#3b82f6")
    series1.columns.template.stroke = am4core.color("#3b82f6")
    series1.columns.template.column.cornerRadiusTopLeft = 8
    series1.columns.template.column.cornerRadiusTopRight = 8

    // --- Members Series ---
    let series2 = chart.series.push(new am4charts.ColumnSeries())
    series2.name = "Members"
    series2.dataFields.valueY = "members"
    series2.dataFields.categoryX = "teamName"
    series2.columns.template.tooltipText = "{categoryX}\nMembers: {valueY}"
    series2.columns.template.fill = am4core.color("#10b981")
    series2.columns.template.stroke = am4core.color("#10b981")
    series2.columns.template.column.cornerRadiusTopLeft = 8
    series2.columns.template.column.cornerRadiusTopRight = 8

    // Legend
    chart.legend = new am4charts.Legend()
    chart.legend.position = "bottom"

    // Animation
    chart.appear()

    chartRef.current = chart

    return () => chart.dispose()
  }, [stats])

  if (!stats || !stats.teamDownloads) {
    return (
      <div className="bg-white p-6 shadow-md border">
        <h2 className="text-xl font-semibold mb-4">Top Teams by Downloads</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-10 w-10 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6  shadow-lg border">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Team Performance</h2>
        <span className="text-sm text-gray-500">
          Top {stats.teamDownloads.slice(0, 8).length} Teams
        </span>
      </div>

      {/* Chart */}
      <div id="teamBarChartDiv" className="w-full h-80" />
    </div>
  )
}
