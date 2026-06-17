import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "@/components/finance/CategoriesTab"
import { ExpenseManagementTab } from "@/components/finance/ExpenseManagementTab"
import { FinanceDashboardTab } from "@/components/finance/FinanceDashboardTab"

export default function FinanceTracking() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold font-[family-name:var(--font-display)]">
          Finance Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          View analytics, manage categories, and track expense history.
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="expenses">Expense Management</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinanceDashboardTab />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
