import { AmountDisplay } from "@/components/finance/AmountDisplay"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AnalyticsSummary({ summary }) {
  const { totalSpend, transactionCount, topCategory } = summary

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total spend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AmountDisplay value={totalSpend} className="text-2xl" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">{transactionCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCategory ? (
            <div>
              <p className="text-lg font-semibold truncate">{topCategory.name}</p>
              <AmountDisplay value={topCategory.total} className="text-sm" />
            </div>
          ) : (
            <p className="text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
