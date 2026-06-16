import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseManagementTab } from "@/components/finance/ExpenseManagementTab"
import { ItemsTab } from "@/components/finance/ItemsTab"

export default function FinanceTracking() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold font-[family-name:var(--font-display)]">
          Finance Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your items and track expense history.
        </p>
      </div>

      <Tabs defaultValue="items">
        <TabsList className="mb-6">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="expenses">Expense Management</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <ItemsTab />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
