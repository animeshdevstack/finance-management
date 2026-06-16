export function AuthShell({ brand, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__brand">{brand}</div>
      <div className="auth-shell__form">{children}</div>
    </div>
  )
}
