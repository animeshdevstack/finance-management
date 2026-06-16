import { Link } from "react-router-dom"
import { ArrowLeft, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function MoneySplit() {
  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-primary">
            <Users className="size-6" />
          </div>
          <CardTitle className="text-2xl">Money Split</CardTitle>
          <CardDescription>
            Split bills with friends, track who owes what, and settle up — just like Splitwise.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This section is under development. For now, use Finance Tracking to manage your
            personal items and expenses.
          </p>
          <Button asChild variant="outline">
            <Link to="/finance-tracking">
              <ArrowLeft className="size-4" />
              Go to Finance Tracking
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
