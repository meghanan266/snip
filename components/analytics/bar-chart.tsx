"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

type BarDataPoint = {
  name: string
  count: number
}

interface HorizontalBarChartProps {
  data: BarDataPoint[]
  emptyMessage?: string
}

export function HorizontalBarChart({
  data,
  emptyMessage = "No data yet",
}: HorizontalBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 40, 120)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={80}
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
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={index === 0 ? "#ffffff" : `rgba(255,255,255,${0.6 - index * 0.1})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
