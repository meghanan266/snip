"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type DataPoint = {
  date: string
  count: number
}

interface ClicksChartProps {
  data: DataPoint[]
}

export function ClicksChart({ data }: ClicksChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-gray-500 text-sm">No click data yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
          }}
          formatter={(value: number) => [value, "Clicks"]}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#ffffff"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#ffffff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
