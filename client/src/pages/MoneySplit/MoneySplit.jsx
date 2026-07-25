import { Route, Routes } from "react-router-dom"

import { GroupDetailPage } from "@/components/money-split/GroupDetailPage"
import { GroupsListPage } from "@/components/money-split/GroupsListPage"

export default function MoneySplit() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold font-[family-name:var(--font-display)]">
          Money Split
        </h1>
        <p className="text-muted-foreground mt-1">
          Split bills with friends, track balances, and settle up.
        </p>
      </div>

      <Routes>
        <Route index element={<GroupsListPage />} />
        <Route path="groups/:groupId" element={<GroupDetailPage />} />
      </Routes>
    </div>
  )
}
