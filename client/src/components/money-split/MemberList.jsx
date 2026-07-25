import { AccountStateBadge } from "@/components/money-split/AccountStateBadge"

export function MemberList({ members = [] }) {
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet.</p>
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li
          key={member.userId}
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium">{member.Name}</p>
            {member.Phone && (
              <p className="text-xs text-muted-foreground">{member.Phone}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {member.role === "owner" && (
              <span className="text-xs text-muted-foreground">Owner</span>
            )}
            <AccountStateBadge state={member.accountState} />
          </div>
        </li>
      ))}
    </ul>
  )
}
