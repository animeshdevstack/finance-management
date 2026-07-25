export function BalanceSummary({ memberBalances = [], settlements = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Net balances</h3>
        <ul className="space-y-2">
          {memberBalances.map((member) => (
            <li
              key={member.userId}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>{member.Name}</span>
              <span
                className={
                  member.netBalance >= 0 ? "text-emerald-300" : "text-rose-300"
                }
              >
                {member.netBalance >= 0 ? "+" : ""}
                {member.netBalance.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Who owes whom</h3>
        {settlements.length === 0 ? (
          <p className="text-sm text-muted-foreground">All settled up.</p>
        ) : (
          <ul className="space-y-2">
            {settlements.map((item) => (
              <li
                key={`${item.fromUserId}-${item.toUserId}`}
                className="rounded-md border px-3 py-2 text-sm"
              >
                {item.fromUserName} owes {item.toUserName} ₹{item.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
