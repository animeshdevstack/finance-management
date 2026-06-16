import { Link, Navigate } from "react-router-dom"
import { LogOut, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/shared/hooks/useAuth"

import "./Home.css"

export default function Home() {
  const { authenticated, logout } = useAuth()

  if (authenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="home-page">
      <header className="home-page__header">
        <div className="home-page__logo">
          <Wallet className="size-6" />
          Money Split
        </div>

        <Button asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      </header>

      <main className="home-page__main">
        <section className="home-page__hero">
          <h1>Split money, not friendships</h1>
          <p>
            A finance-first experience for tracking shared bills and personal expenses.
            Sign in with email or phone using secure OTP verification.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Get started</Link>
          </Button>

          <div className="home-page__stats">
            <div className="home-page__stat-card">
              <span>Secure access</span>
              <strong>OTP verified</strong>
            </div>
            <div className="home-page__stat-card">
              <span>Built for</span>
              <strong>Shared expenses</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
