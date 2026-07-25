import { Link } from "react-router-dom"
import { ArrowRight, PiggyBank, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/shared/hooks/useAuth"

import "./Dashboard.css"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Welcome back, {user?.Name || "User"}</h1>
        <p>Choose a section to get started.</p>
      </div>

      <div className="dashboard__grid">
        <Card className="dashboard__card dashboard__card--active">
          <CardHeader>
            <div className="dashboard__icon dashboard__icon--active">
              <PiggyBank className="size-6" />
            </div>
            <CardTitle>Money Split</CardTitle>
            <CardDescription>
              Splitwise-style shared expenses with friends, roommates, and travel groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/money-split">
                Open money split
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="dashboard__card dashboard__card--muted">
          <CardHeader>
            <div className="dashboard__icon">
              <TrendingUp className="size-6" />
            </div>
            <CardTitle>Finance Tracking</CardTitle>
            <CardDescription>
              Create items, add daily expenses, and track running totals over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/finance-tracking">
                Open finance tracking
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
