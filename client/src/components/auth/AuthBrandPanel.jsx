import { Coins, ShieldCheck, Wallet } from "lucide-react"

export function AuthBrandPanel() {
  return (
    <div className="auth-brand-panel">
      <div className="auth-brand-panel__glow" aria-hidden="true" />

      <div className="auth-brand-panel__content">
        <div className="auth-brand-panel__badge">
          <Wallet className="size-5" />
          <span>Money Split</span>
        </div>

        <h1 className="auth-brand-panel__title">
          Split expenses with confidence
        </h1>

        <p className="auth-brand-panel__subtitle">
          Track shared bills, settle balances, and keep every rupee accounted for
          with secure OTP-based access.
        </p>

        <ul className="auth-brand-panel__features">
          <li>
            <Coins className="size-4" />
            Fair splits for groups and trips
          </li>
          <li>
            <ShieldCheck className="size-4" />
            Bank-grade secure sign-in
          </li>
        </ul>
      </div>
    </div>
  )
}
