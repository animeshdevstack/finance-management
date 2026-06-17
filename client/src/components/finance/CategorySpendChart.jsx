import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { formatAmount } from "@/components/finance/AmountDisplay"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const SLICE_COLORS = [
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#f87171",
]

const LABEL_COLOR = "#f5f0e8"
const MUTED_LABEL_COLOR = "#94a3b8"

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const item = payload[0]?.payload
  if (!item) return null

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="text-emerald-400 tabular-nums">{formatAmount(item.total)}</p>
      <p className="text-xs text-muted-foreground">{item.count} transaction(s)</p>
    </div>
  )
}

function renderSliceLabel({ name, percent, x, y, textAnchor }) {
  if (percent < 0.05) return null

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill={LABEL_COLOR}
      fontSize={12}
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  )
}

export function CategorySpendChart({ data, periodLabel }) {
  const hasData = data.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by category</CardTitle>
        <CardDescription>
          {periodLabel ? `Category breakdown for ${periodLabel}` : "Category breakdown"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={110}
                  innerRadius={50}
                  paddingAngle={2}
                  label={renderSliceLabel}
                  labelLine={{ stroke: MUTED_LABEL_COLOR }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.categoryId}
                      fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: LABEL_COLOR }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-muted-foreground">
            No spending data for this period.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
