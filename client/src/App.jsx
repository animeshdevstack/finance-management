import { Toaster } from "@/components/ui/sonner"
import { PwaUpdateBanner } from "@/components/layout/PwaUpdateBanner"
import { AppRoutes } from "@/routes/AppRoutes"

function App() {
  return (
    <>
      <AppRoutes />
      <PwaUpdateBanner />
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
