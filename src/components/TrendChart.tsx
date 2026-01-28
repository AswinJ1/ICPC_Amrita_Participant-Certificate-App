"use client"

import { useState, useEffect, useRef } from "react"
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"

am4core.useTheme(am4themes_animated)

const FILTERS = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
]

type TrendPoint = {
  date: string
  downloads: number
  newUsers: number
}

type Stats = {
  dailyTrends: TrendPoint[]
}

export default function TrendChart({ stats }: { stats: Stats | null }) {
  const [days, setDays] = useState(30)

  const downloadsChartRef = useRef<am4charts.XYChart | null>(null)
  const downloadsDivRef = useRef<HTMLDivElement | null>(null)

  const usersChartRef = useRef<am4charts.XYChart | null>(null)
  const usersDivRef = useRef<HTMLDivElement | null>(null)

  // Helper to get filtered data
  const getFilteredData = () => {
    if (!stats?.dailyTrends || stats.dailyTrends.length === 0) return []
    const allData = stats.dailyTrends.map((d) => ({
      date: new Date(d.date),
      downloads: d.downloads || 0,
      newUsers: d.newUsers || 0,
    }))
    return allData.slice(-days)
  }

  // Create Downloads chart once
  useEffect(() => {
    if (!downloadsDivRef.current) return
    const chart = am4core.create(downloadsDivRef.current, am4charts.XYChart)
    chart.padding(10, 10, 0, 0)

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis())
    dateAxis.renderer.grid.template.strokeOpacity = 0.05
    dateAxis.renderer.labels.template.fill = am4core.color("#94a3b8")
    dateAxis.renderer.labels.template.fontSize = 10
    dateAxis.dateFormatter.inputDateFormat = "yyyy-MM-dd"
    dateAxis.periodChangeDateFormats.setKey("day", "MMM dd")

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
    valueAxis.renderer.grid.template.strokeOpacity = 0.05
    valueAxis.renderer.labels.template.fill = am4core.color("#94a3b8")
    valueAxis.renderer.labels.template.fontSize = 10
    valueAxis.renderer.minGridDistance = 20

    const series = chart.series.push(new am4charts.LineSeries())
    series.dataFields.dateX = "date"
    series.dataFields.valueY = "downloads"
    series.stroke = am4core.color("#10b981")
    series.strokeWidth = 2
    series.tensionX = 0.8
    series.fill = am4core.color("#10b981")
    series.fillOpacity = 0.15
    series.tooltipText = "{valueY}"

    const bullet = series.bullets.push(new am4charts.CircleBullet())
    bullet.circle.radius = 3
    bullet.circle.fill = am4core.color("#10b981")
    bullet.circle.stroke = am4core.color("#ffffff")
    bullet.circle.strokeWidth = 1

    chart.cursor = new am4charts.XYCursor()
    chart.cursor.lineX.strokeOpacity = 0.2
    chart.cursor.lineY.disabled = true



    chart.appear()

    downloadsChartRef.current = chart

    return () => {
      chart.dispose()
      downloadsChartRef.current = null
    }
  }, [])

  // Create New Users chart once
  useEffect(() => {
    if (!usersDivRef.current) return
    const chart = am4core.create(usersDivRef.current, am4charts.XYChart)
    chart.padding(10, 10, 0, 0)

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis())
    dateAxis.renderer.grid.template.strokeOpacity = 0.05
    dateAxis.renderer.labels.template.fill = am4core.color("#94a3b8")
    dateAxis.renderer.labels.template.fontSize = 10
    dateAxis.dateFormatter.inputDateFormat = "yyyy-MM-dd"
    dateAxis.periodChangeDateFormats.setKey("day", "MMM dd")

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
    valueAxis.renderer.grid.template.strokeOpacity = 0.05
    valueAxis.renderer.labels.template.fill = am4core.color("#94a3b8")
    valueAxis.renderer.labels.template.fontSize = 10
    valueAxis.renderer.minGridDistance = 20

    const series = chart.series.push(new am4charts.LineSeries())
    series.dataFields.dateX = "date"
    series.dataFields.valueY = "newUsers"
    series.stroke = am4core.color("#3b82f6")
    series.strokeWidth = 2
    series.tensionX = 0.8
    series.fill = am4core.color("#3b82f6")
    series.fillOpacity = 0.15
    series.tooltipText = "{valueY}"

    const bullet = series.bullets.push(new am4charts.CircleBullet())
    bullet.circle.radius = 3
    bullet.circle.fill = am4core.color("#3b82f6")
    bullet.circle.stroke = am4core.color("#ffffff")
    bullet.circle.strokeWidth = 1

    chart.cursor = new am4charts.XYCursor()
    chart.cursor.lineX.strokeOpacity = 0.2
    chart.cursor.lineY.disabled = true



    chart.appear()

    usersChartRef.current = chart

    return () => {
      chart.dispose()
      usersChartRef.current = null
    }
  }, [])

  // Update data when stats or days change
  useEffect(() => {
    const filtered = getFilteredData()
    if (!filtered.length) {
      if (downloadsChartRef.current) downloadsChartRef.current.data = []
      if (usersChartRef.current) usersChartRef.current.data = []
      return
    }
    if (downloadsChartRef.current) downloadsChartRef.current.data = filtered
    if (usersChartRef.current) usersChartRef.current.data = filtered
  }, [stats, days])

  if (!stats) {
    return (
      <div className="bg-white p-6  shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Activity Trends
          </h2>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin  h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </div>
    )
  }

  if (!stats.dailyTrends || stats.dailyTrends.length === 0) {
    return (
      <div className="bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Activity Trends
          </h2>
        </div>
        <div className="flex items-center justify-center h-40 text-slate-500">
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-sm">
              Trend data will appear as downloads and registrations grow.
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filtered = getFilteredData()

  return (
    <div className="bg-white p-6  shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Activity Trends
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Recent behaviour for downloads and new users
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-500">
            Showing last {days} days · {filtered.length} points
          </span>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setDays(f.value)}
                className={`px-3 py-1.5  text-xs border transition ${
                  days === f.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two small charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Downloads */}
        <div className=" border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Downloads
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {stats.dailyTrends[stats.dailyTrends.length - 1]?.downloads ?? 0}
              </p>
            </div>
           
          </div>
          <div
            ref={downloadsDivRef}
            className="w-full h-40"
          />
        </div>

        {/* New Users */}
        <div className="border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                New Users
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {stats.dailyTrends[stats.dailyTrends.length - 1]?.newUsers ?? 0}
              </p>
            </div>
           
          </div>
          <div
            ref={usersDivRef}
            className="w-full h-40"
          />
        </div>
      </div>
    </div>
  )
}
